// Temporary type shims to reduce diagnostics when node_modules types are unavailable.
// These are minimal and intentionally permissive, focused on React and common HTML attributes/events.

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react' {
  // Namespace-style types used in code (e.g., React.FC, React.ReactElement, events)
  export namespace React {
    export type ReactElement = any;
    export type ReactNode = any;

    // Synthetic events
    export interface SyntheticEvent<T = any> {
      target: T;
      preventDefault(): void;
      stopPropagation(): void;
    }
    export interface FormEvent<T = any> extends SyntheticEvent<T> {}
    export interface ChangeEvent<T = any> extends SyntheticEvent<T> {}

    // DOM and HTML attributes (highly permissive)
    export interface DOMAttributes<T = any> {
      onChange?: (event: ChangeEvent<T>) => void;
      onSubmit?: (event: FormEvent<T>) => void;
      onClick?: (event: SyntheticEvent<T>) => void;
    }
    export interface HTMLAttributes<T = any> extends DOMAttributes<T> {
      className?: string;
      style?: any;
      id?: string;
      title?: string;
    }
    export interface ButtonHTMLAttributes<T = any> extends HTMLAttributes<T> {
      type?: 'button' | 'submit' | 'reset';
      disabled?: boolean;
    }
    export interface InputHTMLAttributes<T = any> extends HTMLAttributes<T> {
      type?: string;
      value?: any;
      defaultValue?: any;
      checked?: boolean;
      required?: boolean;
      minLength?: number;
      placeholder?: string;
      onChange?: (event: ChangeEvent<T>) => void;
    }
    export interface SelectHTMLAttributes<T = any> extends HTMLAttributes<T> {
      value?: any;
      defaultValue?: any;
      multiple?: boolean;
      onChange?: (event: ChangeEvent<T>) => void;
    }
    export interface LabelHTMLAttributes<T = any> extends HTMLAttributes<T> {}

    // Common helpers
    export type PropsWithChildren<P = {}> = P & { children?: ReactNode };
    export type FC<P = {}> = (props: PropsWithChildren<P>) => ReactElement | null;
  }

  // Hooks (keep permissive but support functional updates)
  export function useState<T = any>(initial?: T): [
    T,
    (value: T | ((prev: T) => T)) => void
  ];
  export function useEffect(effect: (...args: any[]) => any, deps?: any[]): void;
  export function useMemo<T = any>(factory: () => T, deps?: any[]): T;

  // Value namespace export
  export const Fragment: any;

  const ReactDefault: any;
  export default ReactDefault;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react-router-dom' {
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
  export const Link: any;
  export const Navigate: any;
  export function useNavigate(): (path: string) => void;
  export function useParams<T extends Record<string, string | undefined> = any>(): T;
}

declare module 'axios' {
  export type AxiosRequestConfig = any;
  export type AxiosResponse<T = any> = { data: T };

  export interface AxiosInstance {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    interceptors: { request: { use(handler: (config: AxiosRequestConfig) => AxiosRequestConfig): void } };
  }

  export function isAxiosError(payload: any): payload is any;

  const axios: { create(config?: AxiosRequestConfig): AxiosInstance } & AxiosInstance;
  export default axios;
}