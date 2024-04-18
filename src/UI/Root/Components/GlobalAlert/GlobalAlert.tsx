import React, { useEffect, useState } from "react";
import { ToastAlert } from "@/UI/Components";

/**
 * GlobalAlert component.
 * Renders a global alert component that displays a toast alert with a message.
 */
export const GlobalAlert = () => {
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");

  /**
   * Event handler for showing the alert.
   * @param event - The event object containing the message.
   */
  const handleShowAlert = (event) => {
    setMessage(event.detail.message);
    setTitle(event.detail.title);
  };

  useEffect(() => {
    document.addEventListener("show_alert-global", handleShowAlert);

    return () => {
      document.removeEventListener("show_alert-global", handleShowAlert);
    };
  }, []);

  return (
    <ToastAlert
      data-testid="ToastAlert"
      title={title}
      message={message}
      setMessage={setMessage}
    />
  );
};
