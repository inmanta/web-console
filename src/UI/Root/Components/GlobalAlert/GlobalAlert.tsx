import React, { useEffect, useState } from "react";
import { ToastAlert } from "@/UI/Components";
import { words } from "@/UI/words";

export const GlobalAlert = () => {
  const [message, setMessage] = useState("");

  const handleShowAlert = (event) => {
    setMessage(event.detail.message);
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
      title={words("inventory.instanceComposer.failed.title")}
      message={message}
      setMessage={setMessage}
    />
  );
};
