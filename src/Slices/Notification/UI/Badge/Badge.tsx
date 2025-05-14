import React, { useContext, useEffect, useState } from "react";
import { NotificationBadge, NotificationBadgeVariant } from "@patternfly/react-core";
import { useGetPartialNotifications, PartialNotification } from "@/Data/Managers/V2/Notification";
import { DependencyContext } from "@/UI";
import { ToastAlert } from "@/UI/Components";
import { words } from "@/UI/words";

/**
 * Notification badge component that displays a visual indicator for notifications.
 * Shows different variants based on the notification status (read/unread, error/non-error).
 *
 * @param {(): void} onClick - Callback function triggered when the badge is clicked
 */
export const Badge: React.FC<{ onClick(): void }> = ({ onClick }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const envID = environmentHandler.useId();
  const { data, isSuccess, isError, error } = useGetPartialNotifications({
    envID,
    cleared: false,
    orderBy: "desc",
  }).useContinuous();

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isError) {
      setErrorMessage(error.message);
    }
    if (isSuccess && data.errors && data.errors.length > 0) {
      setErrorMessage(data.errors.join(", "));
    }
  }, [data, isError, isSuccess, error]);

  if (errorMessage) {
    return (
      <>
        <ToastAlert
          data-testid="ToastAlert"
          message={errorMessage}
          title={words("error")}
          setMessage={setErrorMessage}
        />
        <NotificationBadge
          aria-label="Badge-Error"
          variant={NotificationBadgeVariant.read}
          isDisabled
        />
      </>
    );
  }

  if (isSuccess) {
    const variant = getVariantFromNotifications(data.notifications);

    return (
      <NotificationBadge
        aria-label="Badge-Success"
        data-variant={variant}
        variant={variant}
        onClick={onClick}
      />
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
 * @param {PartialNotification[]} notifications - List of notifications to analyze
 * @returns {NotificationBadgeVariant} The appropriate badge variant
 */
const getVariantFromNotifications = (
  notifications: PartialNotification[]
): NotificationBadgeVariant => {
  if (notifications.some(isUnreadError)) {
    return NotificationBadgeVariant.attention;
  }

  if (notifications.some(isUnread)) return NotificationBadgeVariant.unread;

  return NotificationBadgeVariant.read;
};

/**
 * Checks if a notification is both unread and has error severity.
 *
 * @param {PartialNotification} notification - The notification to check
 * @returns {boolean} True if the notification is unread and has error severity
 */
const isUnreadError = (notification: PartialNotification) =>
  isUnread(notification) && isError(notification);

/**
 * Checks if a notification has error severity.
 *
 * @param {PartialNotification} notification - The notification to check
 * @returns {boolean} True if the notification has error severity
 */
const isError = (notification: PartialNotification) => notification.severity === "error";

/**
 * Checks if a notification is unread.
 *
 * @param {PartialNotification} notification - The notification to check
 * @returns {boolean} True if the notification is unread
 */
const isUnread = (notification: PartialNotification) => notification.read === false;
