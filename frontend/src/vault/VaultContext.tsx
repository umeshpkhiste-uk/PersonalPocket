// VaultContext — the security core of PersonalPocket.
// Holds vault status, the in-memory decryption key, decrypted records,
// settings, auto-lock timing, biometric unlock, export and permanent wipe.

import * as LocalAuthentication from "expo-local-authentication";
import * as ScreenCapture from "expo-screen-capture";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

import { storage } from "@/src/utils/storage";
import { genId } from "@/src/utils/format";
import {
  decryptString,
  deriveKey,
  encryptString,
  randomHex,
  sha256,
} from "@/src/vault/crypto";
import {
  buildSampleData,
  Category,
  emptyData,
  VaultData,
  VaultRecord,
} from "@/src/vault/schema";

const K_SALT = "pp_salt";
const K_VERIFIER = "pp_verifier";
const K_BIOKEY = "pp_biokey";
const K_DATA = "pp_data";
const K_SETTINGS = "pp_settings";
const K_WEB_SESSION = "pp_web_session_key";

// Web only: a page refresh reruns the whole app, wiping keyRef (plain JS
// memory) and forcing re-entry of the PIN. sessionStorage survives a refresh
// but is cleared when the tab/browser closes, so we use it to carry the
// unlocked key across refreshes within the same browser session only —
// lock()/idle-timeout/wipeAll all clear it too. Native (iOS/Android) never
// touches this; the in-memory-only key there is intentional and unaffected.
function webSessionGetKey(): string | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(K_WEB_SESSION) || null;
  } catch {
    return null;
  }
}
function webSessionSetKey(key: string | null) {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  try {
    if (key) window.sessionStorage.setItem(K_WEB_SESSION, key);
    else window.sessionStorage.removeItem(K_WEB_SESSION);
  } catch {
    /* ignore (private browsing, storage disabled, etc.) */
  }
}

export type VaultStatus = "loading" | "needs_setup" | "locked" | "unlocked";

export interface VaultSettings {
  biometricEnabled: boolean;
  autoLockMinutes: number;
  screenshotProtection: boolean;
}

const DEFAULT_SETTINGS: VaultSettings = {
  biometricEnabled: true,
  autoLockMinutes: 2,
  screenshotProtection: true,
};

interface VaultContextValue {
  status: VaultStatus;
  data: VaultData | null;
  settings: VaultSettings;
  biometricAvailable: boolean;
  setupPin: (pin: string) => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  lock: () => void;
  recordActivity: () => void;
  getRecord: (category: Category, id: string) => VaultRecord | undefined;
  upsertRecord: (category: Category, record: VaultRecord) => Promise<void>;
  deleteRecord: (category: Category, id: string) => Promise<void>;
  updateSettings: (partial: Partial<VaultSettings>) => Promise<void>;
  exportVault: () => Promise<{ ok: boolean; message: string }>;
  wipeAll: () => Promise<void>;
}

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<VaultStatus>("loading");
  const [data, setData] = useState<VaultData | null>(null);
  const [settings, setSettings] = useState<VaultSettings>(DEFAULT_SETTINGS);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const keyRef = useRef<string | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const backgroundAtRef = useRef<number | null>(null);
  const settingsRef = useRef<VaultSettings>(DEFAULT_SETTINGS);
  settingsRef.current = settings;

  // ---- bootstrap ---------------------------------------------------------
  useEffect(() => {
    (async () => {
      const [hasHardware, enrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync().catch(() => false),
        LocalAuthentication.isEnrolledAsync().catch(() => false),
      ]);
      setBiometricAvailable(Boolean(hasHardware && enrolled));

      const savedSettings = await storage.getItem<string>(K_SETTINGS, "");
      if (savedSettings) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
        } catch {
          /* keep defaults */
        }
      }

      const salt = await storage.secureGet<string>(K_SALT, "");
      if (!salt) {
        setStatus("needs_setup");
        return;
      }

      const sessionKey = webSessionGetKey();
      if (sessionKey) {
        const verifier = await storage.secureGet<string>(K_VERIFIER, "");
        if (verifier && sha256(sessionKey) === verifier) {
          await finishUnlock(sessionKey);
          return;
        }
        webSessionSetKey(null); // stale/invalid — don't trust it
      }
      setStatus("locked");
    })();
  }, []);

  // ---- screenshot protection ---------------------------------------------
  useEffect(() => {
    if (Platform.OS === "web") return;
    if (settings.screenshotProtection && status === "unlocked") {
      ScreenCapture.preventScreenCaptureAsync().catch(() => {});
    } else {
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
    }
  }, [settings.screenshotProtection, status]);

  // ---- persistence helpers ------------------------------------------------
  const persistData = useCallback(async (next: VaultData) => {
    if (!keyRef.current) return;
    const cipher = encryptString(JSON.stringify(next), keyRef.current);
    await storage.setItem(K_DATA, cipher);
  }, []);

  const persistSettings = useCallback(async (next: VaultSettings) => {
    await storage.setItem(K_SETTINGS, JSON.stringify(next));
  }, []);

  const loadData = useCallback(async (): Promise<VaultData> => {
    const cipher = await storage.getItem<string>(K_DATA, "");
    if (!cipher || !keyRef.current) return emptyData();
    try {
      const json = decryptString(cipher, keyRef.current);
      const parsed = JSON.parse(json) as VaultData;
      return {
        credentials: parsed.credentials ?? [],
        banking: parsed.banking ?? [],
        investments: parsed.investments ?? [],
        loans: parsed.loans ?? [],
      };
    } catch {
      return emptyData();
    }
  }, []);

  // ---- setup / unlock -----------------------------------------------------
  const setupPin = useCallback(
    async (pin: string) => {
      const salt = await randomHex(16);
      const key = deriveKey(pin, salt);
      keyRef.current = key;
      webSessionSetKey(key);

      await storage.secureSet(K_SALT, salt);
      await storage.secureSet(K_VERIFIER, sha256(key));

      const sample = buildSampleData();
      await persistData(sample);
      setData(sample);

      const nextSettings = {
        ...DEFAULT_SETTINGS,
        biometricEnabled: biometricAvailable,
      };
      await persistSettings(nextSettings);
      setSettings(nextSettings);
      if (biometricAvailable) {
        await storage.secureSet(K_BIOKEY, key);
      }

      lastActivityRef.current = Date.now();
      setStatus("unlocked");
    },
    [biometricAvailable, persistData, persistSettings],
  );

  const finishUnlock = useCallback(
    async (key: string) => {
      keyRef.current = key;
      webSessionSetKey(key);
      const loaded = await loadData();
      setData(loaded);
      lastActivityRef.current = Date.now();
      setStatus("unlocked");
    },
    [loadData],
  );

  const unlockWithPin = useCallback(
    async (pin: string): Promise<boolean> => {
      const salt = await storage.secureGet<string>(K_SALT, "");
      const verifier = await storage.secureGet<string>(K_VERIFIER, "");
      if (!salt || !verifier) return false;
      const key = deriveKey(pin, salt);
      if (sha256(key) !== verifier) return false;
      await finishUnlock(key);
      return true;
    },
    [finishUnlock],
  );

  const unlockWithBiometric = useCallback(async (): Promise<boolean> => {
    if (!settingsRef.current.biometricEnabled) return false;
    const stored = await storage.secureGet<string>(K_BIOKEY, "");
    if (!stored) return false;
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock PersonalPocket",
      cancelLabel: "Use PIN",
      disableDeviceFallback: false,
    });
    if (!result.success) return false;
    await finishUnlock(stored);
    return true;
  }, [finishUnlock]);

  const lock = useCallback(() => {
    keyRef.current = null;
    webSessionSetKey(null);
    setData(null);
    backgroundAtRef.current = null;
    setStatus((s) => (s === "unlocked" ? "locked" : s));
  }, []);

  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // ---- auto-lock: idle timer ---------------------------------------------
  useEffect(() => {
    if (status !== "unlocked") return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= settingsRef.current.autoLockMinutes * 60000) {
        lock();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [status, lock]);

  // ---- auto-lock: background ----------------------------------------------
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (next === "background" || next === "inactive") {
        if (backgroundAtRef.current === null) backgroundAtRef.current = Date.now();
      } else if (next === "active") {
        const bg = backgroundAtRef.current;
        backgroundAtRef.current = null;
        if (bg !== null && status === "unlocked") {
          const elapsed = Date.now() - bg;
          if (elapsed >= settingsRef.current.autoLockMinutes * 60000) {
            lock();
          }
        }
      }
    });
    return () => sub.remove();
  }, [status, lock]);

  // ---- CRUD ---------------------------------------------------------------
  const getRecord = useCallback(
    (category: Category, id: string) => data?.[category].find((r) => r.id === id),
    [data],
  );

  const upsertRecord = useCallback(
    async (category: Category, record: VaultRecord) => {
      if (!data) return;
      const now = new Date().toISOString();
      const list = data[category];
      const existing = list.findIndex((r) => r.id === record.id);
      let nextList: VaultRecord[];
      if (existing >= 0) {
        nextList = [...list];
        nextList[existing] = { ...record, updatedAt: now };
      } else {
        nextList = [{ ...record, id: record.id || genId(), createdAt: now, updatedAt: now }, ...list];
      }
      const next = { ...data, [category]: nextList };
      setData(next);
      await persistData(next);
    },
    [data, persistData],
  );

  const deleteRecord = useCallback(
    async (category: Category, id: string) => {
      if (!data) return;
      const next = { ...data, [category]: data[category].filter((r) => r.id !== id) };
      setData(next);
      await persistData(next);
    },
    [data, persistData],
  );

  // ---- settings -----------------------------------------------------------
  const updateSettings = useCallback(
    async (partial: Partial<VaultSettings>) => {
      const next = { ...settingsRef.current, ...partial };
      setSettings(next);
      await persistSettings(next);

      if (partial.biometricEnabled !== undefined && keyRef.current) {
        if (partial.biometricEnabled) {
          await storage.secureSet(K_BIOKEY, keyRef.current);
        } else {
          await storage.secureRemove(K_BIOKEY);
        }
      }
    },
    [persistSettings],
  );

  // ---- export -------------------------------------------------------------
  const exportVault = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    if (!keyRef.current || !data) return { ok: false, message: "Vault is locked." };
    try {
      const payload = {
        app: "PersonalPocket",
        format: "encrypted-backup-v1",
        exportedAt: new Date().toISOString(),
        note: "This backup is AES-encrypted with your PIN. Keep it private.",
        cipher: encryptString(JSON.stringify(data), keyRef.current),
      };
      if (Platform.OS === "web") {
        return { ok: true, message: "Export is available on a device build." };
      }
      const uri = FileSystem.documentDirectory + "PersonalPocket-backup.json";
      await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload, null, 2));
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/json",
          dialogTitle: "Encrypted PersonalPocket Backup",
        });
      }
      return { ok: true, message: "Encrypted backup saved to your device." };
    } catch {
      return { ok: false, message: "Could not create backup." };
    }
  }, [data]);

  // ---- permanent wipe -----------------------------------------------------
  const wipeAll = useCallback(async () => {
    await Promise.all([
      storage.secureRemove(K_SALT),
      storage.secureRemove(K_VERIFIER),
      storage.secureRemove(K_BIOKEY),
      storage.removeItem(K_DATA),
      storage.removeItem(K_SETTINGS),
    ]);
    keyRef.current = null;
    webSessionSetKey(null);
    setData(null);
    setSettings(DEFAULT_SETTINGS);
    setStatus("needs_setup");
  }, []);

  const value: VaultContextValue = {
    status,
    data,
    settings,
    biometricAvailable,
    setupPin,
    unlockWithPin,
    unlockWithBiometric,
    lock,
    recordActivity,
    getRecord,
    upsertRecord,
    deleteRecord,
    updateSettings,
    exportVault,
    wipeAll,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}
