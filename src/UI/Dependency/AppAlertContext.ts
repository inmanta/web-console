import { createContext, useContext } from "react";
import { AlertProps } from "@patternfly/react-core";

export interface NotifyOptions extends AlertProps {
  /** Alert message */
  message?: string;

  /** Optional data-testid for testing */
  testId?: string;
}

export type NotifyShorthandOptions = Omit<NotifyOptions, "variant">;

export interface AppAlertContextProps {
  notify: (options: NotifyOptions) => void;
  notifySuccess: (options: NotifyShorthandOptions) => void;
  notifyError: (options: NotifyShorthandOptions) => void;
  notifyInfo: (options: NotifyShorthandOptions) => void;
}

const defaultContext: AppAlertContextProps = {
  notify: () => {
    if (import.meta.env.DEV) {
      console.warn("AppAlertContext.notify called outside AppAlertProvider");
    }
  },
  notifySuccess: () => {
    if (import.meta.env.DEV) {
      console.warn("AppAlertContext.notifySuccess called outside AppAlertProvider");
    }
  },
  notifyError: () => {
    if (import.meta.env.DEV) {
      console.warn("AppAlertContext.notifyError called outside AppAlertProvider");
    }
  },
  notifyInfo: () => {
    if (import.meta.env.DEV) {
      console.warn("AppAlertContext.notifyInfo called outside AppAlertProvider");
    }
  },
};

/**
 * The context behind `useAppAlert`. Only the shell's `AppAlertProvider` provides it; outside the
 * provider, the default only warns in development.
 */
export const AppAlertContext = createContext<AppAlertContextProps>(defaultContext);

/**
 * Raises the app-wide toast alerts. The shell renders them with `AppAlertProvider`; any part of
 * the app can raise one through this hook.
 *
 * @returns {AppAlertContextProps} the functions that raise an alert of a given variant
 */
export const useAppAlert = (): AppAlertContextProps => {
  return useContext(AppAlertContext);
};
