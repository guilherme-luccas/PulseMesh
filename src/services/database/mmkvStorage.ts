import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

const STORAGE_ID = 'pulsemesh';

export const mmkv: MMKV = createMMKV({ id: STORAGE_ID });

export const mmkvStateStorage: StateStorage = {
  getItem: (key) => mmkv.getString(key) ?? null,
  setItem: (key, value) => {
    mmkv.set(key, value);
  },
  removeItem: (key) => {
    mmkv.remove(key);
  },
};

export function readStorageString(key: string): string | undefined {
  return mmkv.getString(key);
}

export function writeStorageString(key: string, value: string): void {
  mmkv.set(key, value);
}
