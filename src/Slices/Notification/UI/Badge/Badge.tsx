import React, { useContext, useEffect, useState } from "react";
import {
  NotificationBadge,
  NotificationBadgeVariant,
} from "@patternfly/react-core";
import { RemoteData } from "@/Core";
import { ToastAlert } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Notification } from "@S/Notification/Core/Domain";
import { drawerQuery, ViewData } from "@S/Notification/Core/Query";

export const Badge: React.FC<{ onClick(): void }> = ({ onClick }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useContinuous<"GetNotifications">(drawerQuery);

  return <View {...{ data, onClick }} />;
};

interface Props {
  onClick(): void;
  data: ViewData;
}

export const View: React.FC<Props> = ({ data, onClick }) => {
  const [error, setError] = useState("");

  useEffect(() => {
    if (!RemoteData.isFailed(data)) return;
    setError(data.value);
  }, [data]);

  return RemoteData.fold(
    {
      notAsked: () => (
        <NotificationBadge
          aria-label="Badge"
          variant={NotificationBadgeVariant.read}
          isDisabled
        />
      ),
      loading: () => (
        <NotificationBadge
          aria-label="Badge"
          variant={NotificationBadgeVariant.read}
          isDisabled
        />
      ),
      failed: () => (
        <>
          <ToastAlert
            data-testid="ToastAlert"
            message={error}
            title={words("error")}
            setMessage={setError}
          />
          <NotificationBadge
            aria-label="Badge"
            variant={NotificationBadgeVariant.read}
            isDisabled
          />
        </>
      ),
      success: ({ data: notifications }) => {
        const variant = getVariantFromNotifications(notifications);

        return (
          <NotificationBadge
            aria-label="Badge"
            data-variant={variant}
            variant={variant}
            onClick={onClick}
          />
        );
      },
    },
    data,
  );
};

const getVariantFromNotifications = (
  notifications: Notification[],
): NotificationBadgeVariant => {
  if (notifications.some(isUnreadError)) {
    return NotificationBadgeVariant.attention;
  }
  if (notifications.some(isUnread)) return NotificationBadgeVariant.unread;

  return NotificationBadgeVariant.read;
};

const isUnreadError = (notification: Notification) =>
  isUnread(notification) && isError(notification);

const isError = (notification: Notification) =>
  notification.severity === "error";

const isUnread = (notification: Notification) => notification.read === false;
