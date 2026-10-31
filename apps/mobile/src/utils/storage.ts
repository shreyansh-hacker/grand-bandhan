import * as Keychain from 'react-native-keychain';
import { User } from '@grand-bandhan/shared';

const KEYCHAIN_SERVICE = 'com.grandbandhan.mobile.auth';

export interface StoredAuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * Saves authenticated session securely in Android Keystore
 */
export async function saveAuthSession(session: StoredAuthSession): Promise<boolean> {
  try {
    const payload = JSON.stringify(session);
    await Keychain.setGenericPassword(session.user.id, payload, {
      service: KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return true;
  } catch (error) {
    console.warn('Failed to securely save session in Keystore:', error);
    return false;
  }
}

/**
 * Retrieves authenticated session securely from Android Keystore
 */
export async function getAuthSession(): Promise<StoredAuthSession | null> {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    if (
      credentials &&
      typeof credentials === 'object' &&
      credentials.password &&
      typeof credentials.password === 'string'
    ) {
      try {
        const parsed: StoredAuthSession = JSON.parse(credentials.password);
        return parsed;
      } catch (parseErr) {
        console.warn('Stored session payload is corrupted, clearing...');
        await clearAuthSession();
        return null;
      }
    }
    return null;
  } catch (error) {
    console.warn('No existing Keystore credentials found or read error:', error);
    return null;
  }
}

/**
 * Retrieves the raw access token for API requests
 */
export async function getStoredAccessToken(): Promise<string | null> {
  try {
    const session = await getAuthSession();
    return session ? session.accessToken : null;
  } catch (err) {
    return null;
  }
}

/**
 * Updates stored access token (e.g. after rotation)
 */
export async function updateStoredAccessToken(newToken: string): Promise<boolean> {
  const current = await getAuthSession();
  if (!current) return false;
  return saveAuthSession({
    ...current,
    accessToken: newToken,
  });
}

/**
 * Completely clears stored session from Android Keystore on logout
 */
export async function clearAuthSession(): Promise<boolean> {
  try {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
    return true;
  } catch (error) {
    console.warn('Failed to clear session from Keystore:', error);
    return false;
  }
}
