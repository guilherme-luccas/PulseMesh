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

function readIdentity(raw: string | undefined): DeviceIdentity | null {
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

export const identityService = {
  current(): DeviceIdentity | null {
    return readIdentity(readStorageString(IDENTITY_KEY));
  },

  ensure(): DeviceIdentity {
    const existing = readIdentity(readStorageString(IDENTITY_KEY));
    if (existing) {
      return existing;
    }

    const created = { id: createId(), shortCode: createShortCode() };
    writeStorageString(IDENTITY_KEY, JSON.stringify(created));
    return created;
  },
};
