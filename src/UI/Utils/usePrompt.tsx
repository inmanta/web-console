import { useCallback, useEffect } from "react";
import history from "../Routing/history";

/**
 * Blocks all navigation attempts. This is useful for preventing the page from
 * changing until some condition is met, like saving form data.
 *
 * @param  blocker
 * @param  when
 */
function useConfirmExit(confirmExit: () => boolean, when = true) {
  useEffect(() => {
    if (!when) {
      return;
    }

    const push = history.push;

    history.push = (...args: Parameters<typeof push>) => {
      const result = confirmExit();
      if (result !== false) {
        push(...args);
      }
    };

    return () => {
      history.push = push;
    };
  }, [confirmExit, when]);
}
/**
 * Prompts the user with an Alert before they leave the current screen.
 *
 * @param  message
 * @param  when
 */
export function usePrompt(message: string, when = true) {
  useEffect(() => {
    if (when) {
      Object.defineProperty(window, "onbeforeunload", {
        value: function () {
          return message;
        },
        configurable: true,
        enumerable: true,
      });
    }

    return () => {
      Object.defineProperty(window, "onbeforeunload", {
        value: null,
        configurable: true,
        enumerable: true,
      });
    };
  }, [message, when]);

  const confirmExit = useCallback(() => {
    const confirm = window.confirm(message);
    return confirm;
  }, [message]);
  useConfirmExit(confirmExit, when);
}
