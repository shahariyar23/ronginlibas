import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  AuthProvider,
  UserCredential,
  Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  if (!isFirebaseConfigured()) return null;

  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  return getAuth(app);
}

export interface SocialAuthResult {
  idToken: string;
  provider: 'GOOGLE';
  providerUid: string;
  email: string | null;
  fullName?: string | null;
  photoUrl?: string | null;
}

function getProviderInstance(_type: 'google' = 'google'): AuthProvider {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

export function mapFirebaseError(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const code = error.code || '';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled: The login pop-up was closed before completion.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was interrupted by another request.';
    case 'auth/popup-blocked':
      return 'Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email address under a different login method. Please sign in with that method first, then link this account from your profile.';
    case 'auth/credential-already-in-use':
      return 'This social account is already associated with another customer profile.';
    case 'auth/operation-not-allowed':
      return 'This authentication provider is not enabled in Firebase Authentication console. Please enable it in project settings.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet and try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Authentication. Please add localhost and ronginlibas.com to Firebase Authorized Domains.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact customer care.';
    case 'auth/invalid-credential':
      return 'The credentials received from the provider are invalid or expired.';
    default:
      if (error.message?.includes('configuration')) {
        return 'Firebase client credentials are not configured yet.';
      }
      return error.message || 'Authentication failed. Please try again.';
  }
}

/**
 * @deprecated Google authentication has been migrated directly to Google Identity Services (GIS).
 * Use loginWithGoogle() and renderGisButton() instead of Firebase Auth.
 */
export async function authenticateWithFirebaseProvider(
  providerType: 'google' = 'google'
): Promise<SocialAuthResult> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      'Firebase is not configured. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, and NEXT_PUBLIC_FIREBASE_PROJECT_ID are set.'
    );
  }

  const provider = getProviderInstance(providerType);

  let credential: UserCredential;
  try {
    credential = await signInWithPopup(auth, provider);
  } catch (err: any) {
    // If popup blocked on mobile devices, could optionally redirect
    throw new Error(mapFirebaseError(err));
  }

  const user = credential.user;
  const idToken = await user.getIdToken(true);

  return {
    idToken,
    provider: 'GOOGLE',
    providerUid: user.uid,
    email: user.email,
    fullName: user.displayName,
    photoUrl: user.photoURL,
  };
}

/**
 * Link an additional social provider to the currently authenticated Firebase user
 */
export async function linkFirebaseProvider(
  providerType: 'google' = 'google'
): Promise<SocialAuthResult> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase is not configured.');
  }

  const currentUser = auth.currentUser;
  const provider = getProviderInstance(providerType);

  let credential: UserCredential;
  if (currentUser) {
    try {
      credential = await linkWithPopup(currentUser, provider);
    } catch (err: any) {
      throw new Error(mapFirebaseError(err));
    }
  } else {
    // If user has no active Firebase session on this client, sign in to acquire new ID token
    try {
      credential = await signInWithPopup(auth, provider);
    } catch (err: any) {
      throw new Error(mapFirebaseError(err));
    }
  }

  const idToken = await credential.user.getIdToken(true);

  return {
    idToken,
    provider: 'GOOGLE',
    providerUid: credential.user.uid,
    email: credential.user.email,
    fullName: credential.user.displayName,
    photoUrl: credential.user.photoURL,
  };
}
