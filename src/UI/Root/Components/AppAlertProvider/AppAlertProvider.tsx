import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { AlertGroup, AlertVariant } from "@patternfly/react-core";
import { AppAlert as AppAlertComponent } from "@/UI/Components";

export interface AppAlertItem {
  /** Unique ID for the alert */
  id: number;

  /** Alert title */
  title: string;

  /** Alert message */
  message?: string;

  /** Optional alert variant */
  variant?: AlertVariant;

  /** Optional data-testid for testing */
  "data-testid"?: string;
}

interface AppAlertContextProps {
  /**
   * Show a toast alert
   * @param title - The alert title
   * @param message - The alert message
   * @param testId - Optional data-testid for the alert
   * @param variant - Optional AlertVariant (default info)
   */
  notify: (title: string, message?: string, testId?: string, variant?: AlertVariant) => void;
  notifySuccess: (title: string, message?: string, testId?: string) => void;
  notifyError: (title: string, message?: string, testId?: string) => void;
  notifyInfo: (title: string, message?: string, testId?: string) => void;
}

const defaultContext: AppAlertContextProps = {
  notify: () => {
    if (import.meta.env.DEV) console.warn("AppAlertContext.notify called outside AppAlertProvider");
  },
  notifySuccess: () => {
    if (import.meta.env.DEV)
      console.warn("AppAlertContext.notifySuccess called outside AppAlertProvider");
  },
  notifyError: () => {
    if (import.meta.env.DEV)
      console.warn("AppAlertContext.notifyError called outside AppAlertProvider");
  },
  notifyInfo: () => {
    if (import.meta.env.DEV)
      console.warn("AppAlertContext.notifyInfo called outside AppAlertProvider");
  },
};

const AppAlertContext = createContext<AppAlertContextProps>(defaultContext);

export const useAppAlert = (): AppAlertContextProps => {
  return useContext(AppAlertContext);
};

let idCounter = 0;

interface AppAlertProviderProps {
  children: ReactNode;
}

export const AppAlertProvider: React.FC<AppAlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<AppAlertItem[]>([]);
  const timersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const remove = useCallback((id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));

    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (
      title: string,
      message?: string,
      testId?: string,
      variant: AlertVariant = AlertVariant.info
    ) => {
      const id = ++idCounter;
      setAlerts((prev) => [
        { id, title, message, "data-testid": testId ?? "ToastAlert", variant },
        ...prev,
      ]);

      const timer = setTimeout(() => remove(id), 8000);
      timersRef.current.set(id, timer);
    },
    [remove]
  );

  const notifySuccess = useCallback(
    (title: string, message?: string, testId?: string) =>
      notify(title, message, testId, AlertVariant.success),
    [notify]
  );

  const notifyError = useCallback(
    (title: string, message?: string, testId?: string) =>
      notify(title, message, testId, AlertVariant.danger),
    [notify]
  );

  const notifyInfo = useCallback(
    (title: string, message?: string, testId?: string) =>
      notify(title, message, testId, AlertVariant.info),
    [notify]
  );

  useEffect(() => {
    const currentTimers = timersRef.current;
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer));
      currentTimers.clear();
    };
  }, []);

  return (
    <AppAlertContext.Provider value={{ notify, notifySuccess, notifyError, notifyInfo }}>
      {children}

      {alerts.length > 0 && (
        <AlertGroup isToast aria-live="polite" isLiveRegion>
          {alerts.map(({ id, title, message, "data-testid": testId, variant }) => (
            <AppAlertComponent
              key={id}
              title={title}
              message={message}
              variant={variant}
              data-testid={testId}
              onClose={() => remove(id)}
              isInline={false}
            />
          ))}
        </AlertGroup>
      )}
    </AppAlertContext.Provider>
  );
};
