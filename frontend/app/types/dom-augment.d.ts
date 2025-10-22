// Allow non-standard directory upload attributes on <input type="file">
import 'react';

declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    /** Chromium/Safari directory picker */
    webkitdirectory?: boolean;
    /** Firefox directory picker */
    mozdirectory?: boolean;
    /** Generic directory attribute (non-standard) */
    directory?: boolean;
  }
}

export {};
