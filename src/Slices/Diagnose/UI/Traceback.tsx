import React from "react";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import { ExpandableSection } from "@patternfly/react-core";
import { words } from "@/UI/words";

export const Traceback: React.FC<{ trace: string }> = ({ trace }) => {
  return (
    <ExpandableSection toggleText={words("diagnose.rejection.traceback")}>
      <CodeEditor
        code={trace}
        language={Language.python}
        isReadOnly
        isDownloadEnabled
        isCopyEnabled
        height="400px"
      />
    </ExpandableSection>
  );
};
