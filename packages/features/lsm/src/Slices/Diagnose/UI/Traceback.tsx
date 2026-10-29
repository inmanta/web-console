import React from "react";
import { Language } from "@patternfly/react-code-editor";
import { CodeEditor } from "@inmanta/web-console-ui/Components/CodeEditor";

/**
 * A component that displays a traceback.
 *
 * @prop {string} trace - The traceback to display.
 * @returns {React.FC} A component that displays a traceback.
 */
export const Traceback: React.FC<{ trace: string }> = ({ trace }) => {
  return <CodeEditor code={trace} language={Language.python} height="400px" />;
};
