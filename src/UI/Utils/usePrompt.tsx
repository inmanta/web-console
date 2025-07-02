import { useCallback, useEffect } from "react";
import { useBlocker } from "react-router";

/**
 * Prompts the user with an Alert before they leave the current screen.
 *
 * @param  message
 * @param  when
 */
export function usePrompt(message: string, when = true) {
  const blocker = useCallback(() => {
    if (when) {
      return !window.confirm(message);
    }
    return false;
  }, [message, when]);

  useBlocker(blocker);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (when) {
        event.preventDefault();

        /**returnValue is a legacy feature, and best practice is to trigger the dialog by invoking Event.preventDefault() on the BeforeUnloadEvent object,
         * while also setting returnValue to support legacy cases. See the beforeunload event reference for detailed up-to-date guidance.
         */
        event.returnValue = message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [message, when]);
}
