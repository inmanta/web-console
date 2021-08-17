import React from "react";
// import React, { useState } from "react";
import { TextWithCopy } from "@/UI/Components";
// import { CodeHighlighter, TextWithCopy } from "@/UI/Components";
// import { Button } from "@patternfly/react-core";
// import { DownloadIcon } from "@patternfly/react-icons";

export const FileBlock: React.FC<{ hash: string }> = ({ hash }) => {
  // const [fileContent, setFileContent] = useState<null | string>(null);

  // const getFile = async () => setFileContent("test");
  // const close = () => setFileContent(null);

  return (
    <>
      <TextWithCopy
        shortText={hash}
        fullText={hash}
        tooltipContent="Copy to clipboard"
      />
      {/* <Button
        variant="link"
        icon={<DownloadIcon />}
        onClick={getFile}
        isDisabled={fileContent !== null}
      >
        Get File
      </Button>
      {fileContent && (
        <CodeHighlighter code={fileContent} language="text" close={close} />
      )} */}
    </>
  );
};
