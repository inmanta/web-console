import React, { useState, useContext } from "react";
import { Alert, AlertActionCloseButton, Button } from "@patternfly/react-core";
import { DownloadIcon } from "@patternfly/react-icons";
import { RemoteData } from "@/Core";
import { CodeHighlighter } from "@/UI/Components/CodeHighlighter";
import { Spinner } from "@/UI/Components/Spinner";
import { TextWithCopy } from "@/UI/Components/TextWithCopy";
import { DependencyContext } from "@/UI/Dependency";
import { Delayed } from "@/UI/Utils";

export const FileBlock: React.FC<{ hash: string }> = ({ hash }) => {
  const { fileFetcher } = useContext(DependencyContext);
  const [fileContent, setFileContent] = useState<
    RemoteData.Type<string, string>
  >(RemoteData.notAsked());

  const getFile = async () => {
    setFileContent(RemoteData.loading());
    setFileContent(RemoteData.fromEither(await fileFetcher.get(hash)));
  };
  const close = () => setFileContent(RemoteData.notAsked);

  return (
    <>
      <TextWithCopy value={hash} tooltipContent="Copy to clipboard" />
      <Button
        variant="link"
        icon={<DownloadIcon />}
        onClick={getFile}
        isDisabled={
          RemoteData.isSuccess(fileContent) || RemoteData.isLoading(fileContent)
        }
      >
        Get File
      </Button>
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => (
            <Delayed delay={500}>
              <div>
                <Spinner variant="small" />
              </div>
            </Delayed>
          ),
          failed: (message) => (
            <Alert
              variant="danger"
              isInline
              title="Something went wrong with fetching the file content"
              actionClose={<AlertActionCloseButton onClose={close} />}
            >
              {message}
            </Alert>
          ),
          success: (content) => (
            <CodeHighlighter code={content} language="text" close={close} />
          ),
        },
        fileContent,
      )}
    </>
  );
};
