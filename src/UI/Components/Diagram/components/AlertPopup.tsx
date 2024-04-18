import React, { useEffect, useState } from "react";
import { AlertVariant } from "@patternfly/react-core";
import { ToastAlert } from "@/UI/Components/ToastAlert";
import { words } from "@/UI/words";
import { AlertPopups } from "../interfaces";

/**
 * Renders an alert popup component.
 *
 * @component
 * @param {AlertPopups} message - The alert message object.
 * @param {AlertVariant} alertType - The type of alert variant.
 * @param {Function} setAlertMessage - The function to set the alert message.
 * @returns {JSX.Element} The rendered alert popup component.
 */
export const AlertPopup = ({
  message,
  alertType,
  setAlertMessage,
}: {
  message: AlertPopups;
  alertType: AlertVariant;
  setAlertMessage: (message: string) => void;
}) => {
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    if (message.type === "composer") {
      setTitle(
        alertType === AlertVariant.success
          ? words("inventory.instanceComposer.success.title")
          : words("inventory.instanceComposer.failed.title"),
      );
    } else {
      setTitle(words("inventory.instanceComposer.generalFail.title"));
    }
  }, [message, alertType]);

  if (!message) {
    return null;
  }

  return (
    <ToastAlert
      data-testid="ToastAlert"
      title={title}
      message={message.message}
      setMessage={setAlertMessage}
      type={alertType}
    />
  );
};
