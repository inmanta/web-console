import React, { useEffect, useState } from "react";
import {
  NotificationBadge,
  NotificationBadgeVariant,
} from "@patternfly/react-core";
import { UseQueryResult } from "@tanstack/react-query";
import { PageSize } from "@/Core";
import {
  NotificationResponse,
  useGetNotifications,
} from "@/Data/Managers/V2/Notification/GetNotifications";
import { ToastAlert } from "@/UI/Components";
import { words } from "@/UI/words";
import { Notification } from "@S/Notification/Core/Domain";

export const Badge: React.FC<{ onClick(): void }> = ({ onClick }) => {
  const response = useGetNotifications({
    pageSize: PageSize.from("250"),
    origin: "drawer",
    currentPage: { kind: "CurrentPage", value: "" },
  }).useContinuous();

  return <View {...{ response, onClick }} />;
};

interface Props {
  onClick(): void;
  response: UseQueryResult<NotificationResponse, Error>;
}

const View: React.FC<Props> = ({ response, onClick }) => {
  const [error, setError] = useState("");

  useEffect(() => {
    if (!response.isError) return;
    setError(response.error.message);
  }, [response]);

  if (response.isSuccess) {
    const variant = getVariantFromNotifications(response.data.data);

    return (
      <NotificationBadge
        aria-label="Badge"
        data-variant={variant}
        variant={variant}
        onClick={onClick}
      />
    );
  }

  if (response.isError) {
    return (
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
    );
  }

  return (
    <NotificationBadge
      aria-label="Badge"
      variant={NotificationBadgeVariant.read}
      isDisabled
    />
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
