import { createContext, useContext } from "react";
import { AlertProps } from "@patternfly/react-core";

/**
 * The app-wide toast alerts. The shell renders them with `AppAlertProvider`; any part of the app
 * raises one through `useAppAlert`.
 */

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

export const AppAlertContext = createContext<AppAlertContextProps>(defaultContext);

export const useAppAlert = (): AppAlertContextProps => {
  return useContext(AppAlertContext);
};
