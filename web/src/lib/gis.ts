/**
 * Google Identity Services (GIS) Client Helper
 * Direct integration with Google's official GIS library (https://accounts.google.com/gsi/client).
 */

export function getGoogleClientId(): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.warn(
      '[GIS] Warning: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured in environment variables.'
    );
  }
  return clientId || '';
}

/**
 * Ensures Google Identity Services script is loaded and ready.
 */
export function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existingScript) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          resolve();
        } else if (attempts > 50) {
          clearInterval(interval);
          reject(new Error('Timed out waiting for Google Identity Services to initialize.'));
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          resolve();
        } else if (attempts > 30) {
          clearInterval(interval);
          resolve(); // Resolve anyway, accounts might be ready
        }
      }, 50);
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services library.'));
    };
    document.head.appendChild(script);
  });
}

export interface RenderGoogleButtonOptions {
  onSuccess: (credential: string) => void | Promise<void>;
  onError?: (error: Error) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number | string;
  logoAlignment?: 'left' | 'center';
}

/**
 * Initializes Google Identity Services and renders the official Sign in with Google button into a target container.
 */
export async function renderGisButton(
  container: HTMLElement,
  options: RenderGoogleButtonOptions
): Promise<void> {
  await loadGisScript();

  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Google Client ID is missing. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID.');
  }

  if (!window.google?.accounts?.id) {
    throw new Error('Google Identity Services SDK is not available.');
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: google.accounts.id.CredentialResponse) => {
      if (response.credential) {
        options.onSuccess(response.credential);
      } else {
        options.onError?.(new Error('Google did not return an authentication credential.'));
      }
    },
    ux_mode: 'popup',
    cancel_on_tap_outside: true,
  });

  const targetWidth =
    typeof options.width === 'number'
      ? Math.min(Math.max(options.width, 200), 400)
      : options.width;

  window.google.accounts.id.renderButton(container, {
    type: 'standard',
    theme: options.theme || 'outline',
    size: options.size || 'large',
    text: options.text || 'continue_with',
    shape: options.shape || 'rectangular',
    logo_alignment: options.logoAlignment || 'left',
    width: targetWidth,
  });
}
