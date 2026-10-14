/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
  clientId?: string;
}

export interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  ux_mode?: 'popup' | 'redirect';
  login_uri?: string;
  native_callback?: (response: unknown) => void;
  context?: 'signin' | 'signup' | 'use';
}

export interface GsiButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number | string;
  locale?: string;
  click_listener?: () => void;
}

declare global {
  namespace google {
    namespace accounts {
      namespace id {
        type CredentialResponse = GoogleCredentialResponse;
        type IdConfiguration = GoogleIdConfiguration;
        type ButtonConfiguration = GsiButtonConfiguration;

        function initialize(config: GoogleIdConfiguration): void;
        function renderButton(
          parent: HTMLElement,
          options: GsiButtonConfiguration,
          customClickHandler?: () => void,
        ): void;
        function prompt(momentListener?: (moment: any) => void): void;
        function cancel(): void;
        function revoke(hint: string, done: (response: any) => void): void;
      }
    }
  }

  interface Window {
    google?: {
      accounts?: {
        id?: typeof google.accounts.id;
      };
    };
  }
}

export {};
