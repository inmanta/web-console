import React, { useState, useCallback, PropsWithChildren } from "react";
import { AlertGroup, AlertVariant } from "@patternfly/react-core";
import { v4 as uuidv4 } from "uuid";
import { AppAlert as AppAlertComponent } from "@/UI/Components/AppAlert";
import {
  AppAlertContext,
  NotifyOptions,
  NotifyShorthandOptions,
} from "@/UI/Dependency/AppAlertContext";

export const AppAlertProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [alerts, setAlerts] = useState<NotifyOptions[]>([]);

  const remove = useCallback((id?: string) => {
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
            component="div"
            //custom but can be overwritten
            timeout={8000}
            onClose={() => remove(id)}
            onTimeout={() => remove(id)}
            {...rest}
          />
        ))}
      </AlertGroup>
    </AppAlertContext.Provider>
  );
};
