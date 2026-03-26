import React, { createContext, useContext, useState, useCallback, PropsWithChildren } from "react";
import { AlertGroup, AlertVariant, AlertProps } from "@patternfly/react-core";
import { v4 as uuidv4 } from "uuid";
import { AppAlert as AppAlertComponent } from "@/UI/Components";

export interface AppAlertItem extends AlertProps {
  /** Alert message */
  message?: string;

  /** Optional data-testid for testing */
  testId?: string;
}

interface NotifyOptions extends AlertProps {
  /** Alert message */
  message?: string;

  /** Optional data-testid for testing */
  testId?: string;
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

export const AppAlertProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [alerts, setAlerts] = useState<AppAlertItem[]>([]);

  const remove = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const notify = useCallback(({ ...rest }: NotifyOptions) => {
    setAlerts((prev) => [{ id: uuidv4(), ...rest }, ...prev]);
  }, []);

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

  return (
    <AppAlertContext.Provider value={{ notify, notifySuccess, notifyError, notifyInfo }}>
      {children}

      <AlertGroup isToast isLiveRegion>
        {alerts?.map(({ id, ...rest }) => (
          <AppAlertComponent
            key={id}
            //custom but can be overwritten
            timeout={8000}
            onClose={() => remove(id || "")}
            onTimeout={() => remove(id || "")}
            {...rest}
          />
        ))}
      </AlertGroup>
    </AppAlertContext.Provider>
  );
};
