import * as SecureStore from 'expo-secure-store';
import { ApiError } from '../api/httpClient';
import { peopleApi } from '../api/peopleApi';
import { readStorageString, writeStorageString } from '../database/mmkvStorage';

const IDENTITY_KEY = 'pulsemesh.identity';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export interface DeviceIdentity {
  id: string;
  shortCode: string;
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createShortCode(): string {
  let code = '';
  for (let index = 0; index < 4; index += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

export function readIdentity(raw: string | undefined | null): DeviceIdentity | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'id' in parsed &&
      'shortCode' in parsed &&
      typeof parsed.id === 'string' &&
      typeof parsed.shortCode === 'string'
    ) {
      return { id: parsed.id, shortCode: parsed.shortCode };
    }
  } catch {
    return null;
  }

  return null;
}

function writeLocal(identity: DeviceIdentity): void {
  writeStorageString(IDENTITY_KEY, JSON.stringify(identity));
}

async function writeSecure(identity: DeviceIdentity): Promise<void> {
  try {
    await SecureStore.setItemAsync(IDENTITY_KEY, JSON.stringify(identity));
  } catch {
    // The keychain can be unavailable. The local copy still works until the app is removed.
  }
}

let preparing: Promise<void> | null = null;

export const identityService = {
  prepare(): Promise<void> {
    preparing ??= (async () => {
      try {
        const stored = readIdentity(await SecureStore.getItemAsync(IDENTITY_KEY));
        if (stored) {
          writeLocal(stored);
          return;
        }
      } catch {
        // Fall through to the copy already on this install.
      }

      const local = readIdentity(readStorageString(IDENTITY_KEY));
      if (local) {
        await writeSecure(local);
      }
    })();

    return preparing;
  },

  current(): DeviceIdentity | null {
    return readIdentity(readStorageString(IDENTITY_KEY));
  },

  ensure(): DeviceIdentity {
    const existing = readIdentity(readStorageString(IDENTITY_KEY));
    if (existing) {
      return existing;
    }

    const created = { id: createId(), shortCode: createShortCode() };
    writeLocal(created);
    void writeSecure(created);
    return created;
  },

  async restore(shortCode: string): Promise<DeviceIdentity> {
    await this.prepare();
    try {
      const person = await peopleApi.recover(shortCode.trim().toUpperCase());
      const identity = { id: person.id, shortCode: person.shortCode };
      writeLocal(identity);
      await writeSecure(identity);
      return identity;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new Error('Sem servidor para recuperar o código.');
    }
  },
};
