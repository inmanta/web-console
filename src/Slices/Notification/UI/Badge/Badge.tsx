import React, { useEffect, useState } from "react";
import { NotificationBadge, NotificationBadgeVariant } from "@patternfly/react-core";
import { UseQueryResult } from "@tanstack/react-query";
import { PageSize } from "@/Core";
import {
  NotificationResponse,
  useGetNotifications,
} from "@/Data/Queries/Slices/Notification/GetNotifications";
import { ToastAlert } from "@/UI/Components";
import { words } from "@/UI/words";
import { Notification } from "@S/Notification/Core/Domain";

/**
 * Notification badge component that displays a visual indicator for notifications.
 * Shows different variants based on the notification status (read/unread, error/non-error).
 *
 * @param {() => void} onClick - Callback function triggered when the badge is clicked
 */
export const Badge: React.FC<{ onClick(): void }> = ({ onClick }) => {
  const response = useGetNotifications({
    pageSize: PageSize.from("250"),
    origin: "drawer",
    currentPage: { kind: "CurrentPage", value: "" },
  }).useContinuous();

  return <View {...{ response, onClick }} />;
};

/**
 * Props for the View component.
 *
 * @property {() => void} onClick - Callback function triggered when the badge is clicked
 * @property {UseQueryResult<NotificationResponse, Error>} response - Query result containing notification data
 */
interface Props {
  onClick(): void;
  response: UseQueryResult<NotificationResponse, Error>;
}

/**
 * Internal view component that renders the notification badge based on the query response.
 * Handles loading, error, and success states.
 */
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
        aria-label="Badge-Success"
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
          aria-label="Badge-Error"
          variant={NotificationBadgeVariant.read}
          isDisabled
        />
      </>
    );
  }

  return (
    <NotificationBadge aria-label="Badge" variant={NotificationBadgeVariant.read} isDisabled />
  );
};

/**
 * Determines the badge variant based on the notification list.
 * Returns 'attention' for unread error notifications, 'unread' for any unread notifications,
 * and 'read' for all other cases.
 *
 * @param {Notification[]} notifications - List of notifications to analyze
 * @returns {NotificationBadgeVariant} The appropriate badge variant
 */
const getVariantFromNotifications = (notifications: Notification[]): NotificationBadgeVariant => {
  if (notifications.some(isUnreadError)) {
    return NotificationBadgeVariant.attention;
  }

  if (notifications.some(isUnread)) return NotificationBadgeVariant.unread;

  return NotificationBadgeVariant.read;
};

/**
 * Checks if a notification is both unread and has error severity.
 *
 * @param {Notification} notification - The notification to check
 * @returns {boolean} True if the notification is unread and has error severity
 */
const isUnreadError = (notification: Notification) =>
  isUnread(notification) && isError(notification);

/**
 * Checks if a notification has error severity.
 *
 * @param {Notification} notification - The notification to check
 * @returns {boolean} True if the notification has error severity
 */
const isError = (notification: Notification) => notification.severity === "error";

/**
 * Checks if a notification is unread.
 *
 * @param {Notification} notification - The notification to check
 * @returns {boolean} True if the notification is unread
 */
const isUnread = (notification: Notification) => notification.read === false;
