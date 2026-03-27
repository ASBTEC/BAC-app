import { Platform } from 'react-native';

// Web: use localStorage (synchronous, always available in browsers).
// Native: use expo-file-system/legacy (classic URI-based API, works in Expo Go).

let _getItem: (key: string) => Promise<string | null>;
let _setItem: (key: string, value: string) => Promise<void>;

if (Platform.OS === 'web') {
  _getItem = async (key) => localStorage.getItem(key);
  _setItem = async (key, value) => { localStorage.setItem(key, value); };
} else {
  // Lazy require keeps Metro from bundling expo-file-system on web builds.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const FileSystem = require('expo-file-system/legacy');
  const STORE_DIR = (FileSystem.documentDirectory ?? '') + 'bac_store/';

  const ensureDir = async () => {
    const info = await FileSystem.getInfoAsync(STORE_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(STORE_DIR, { intermediates: true });
    }
  };

  _getItem = async (key) => {
    await ensureDir();
    const path = STORE_DIR + encodeURIComponent(key) + '.json';
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return null;
    return FileSystem.readAsStringAsync(path);
  };

  _setItem = async (key, value) => {
    await ensureDir();
    await FileSystem.writeAsStringAsync(
      STORE_DIR + encodeURIComponent(key) + '.json',
      value,
    );
  };
}

export const getItem = _getItem;
export const setItem = _setItem;
