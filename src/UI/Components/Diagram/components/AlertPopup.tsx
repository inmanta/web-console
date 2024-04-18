import React, { useEffect, useState } from "react";
import { AlertVariant } from "@patternfly/react-core";
import { ToastAlert } from "@/UI/Components/ToastAlert";
import { words } from "@/UI/words";
import { AlertPopups } from "../interfaces";

export const AlertPopup = ({
  message,
  alertType,
  setAlertMessage,
}: {
  message: AlertPopups;
  alertType;
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
