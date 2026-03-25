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

interface NotifyOptions {
  /** Alert title */
  title: string;

  /** Alert message */
  message?: string;

  /** Optional data-testid for testing */
  testId?: string;

  /** Optional AlertVariant (default: info) */
  variant?: AlertVariant;
}

type NotifyShorthandOptions = Omit<NotifyOptions, "variant">;

interface AppAlertContextProps {
  notify: (options: NotifyOptions) => void;
  notifySuccess: (options: NotifyShorthandOptions) => void;
  notifyError: (options: NotifyShorthandOptions) => void;
  notifyInfo: (options: NotifyShorthandOptions) => void;
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
    ({ title, message, testId, variant = AlertVariant.info }: NotifyOptions) => {
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
    (options: NotifyShorthandOptions) => notify({ ...options, variant: AlertVariant.success }),
    [notify]
  );

  const notifyError = useCallback(
    (options: NotifyShorthandOptions) => notify({ ...options, variant: AlertVariant.danger }),
    [notify]
  );

  const notifyInfo = useCallback(
    (options: NotifyShorthandOptions) => notify({ ...options, variant: AlertVariant.info }),
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
