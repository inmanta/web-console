import React, { useState, useEffect } from "react";
import { CodeEditor } from "@patternfly/react-code-editor";
import { Alert, AlertActionCloseButton, Button, Spinner } from "@patternfly/react-core";
import { DownloadIcon } from "@patternfly/react-icons";
import { useGetFile } from "@/Data/Managers/V2/Server/GetFile";
import { TextWithCopy } from "@/UI/Components/TextWithCopy";
import { Delayed } from "@/UI/Utils";
import { words } from "@/UI/words";
export const FileBlock: React.FC<{ hash: string }> = ({ hash }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutate, data, error, isError, isSuccess, isPending } = useGetFile(hash);

  const close = () => setErrorMessage(null);

  useEffect(() => {
    if (isError) {
      setErrorMessage(error.message);
    }
  }, [isError, error]);

  const copyAndButton = (
    <>
      <TextWithCopy value={hash} tooltipContent={words("copy.clipboard")} />
      <Button
        variant="link"
        icon={<DownloadIcon />}
        onClick={() => mutate()}
        isDisabled={isPending || isSuccess}
      >
        {words("resources.file.get")}
      </Button>
    </>
  );

  if (errorMessage) {
    return (
      <>
        {copyAndButton}
        <Alert
          variant="danger"
          isInline
          title={words("resources.file.error")}
          actionClose={<AlertActionCloseButton onClose={close} />}
        >
          {errorMessage}
        </Alert>
      </>
    );
  }

  if (isSuccess) {
    return (
      <>
        {copyAndButton}
        <CodeEditor code={data} isReadOnly isDownloadEnabled height="300px" />
      </>
    );
  }

  if (isPending) {
    return (
      <>
        {copyAndButton}
        <Delayed delay={500}>
          <div>
            <Spinner size="sm" />
          </div>
        </Delayed>
      </>
    );
  }

  return copyAndButton;
};
