import { Directory, File, Paths } from 'expo-file-system';

// expo-file-system is a core Expo module available in Expo Go and all native builds.
// SDK 54 uses a class-based API: File / Directory / Paths.

const storeDir = new Directory(Paths.document, 'bac_store');

function ensureDir(): void {
  if (!storeDir.exists) {
    storeDir.create({ idempotent: true });
  }
}

export async function getItem(key: string): Promise<string | null> {
  ensureDir();
  const file = new File(storeDir, encodeURIComponent(key) + '.json');
  if (!file.exists) return null;
  return file.text();
}

export function setItem(key: string, value: string): void {
  ensureDir();
  const file = new File(storeDir, encodeURIComponent(key) + '.json');
  file.write(value);
}
