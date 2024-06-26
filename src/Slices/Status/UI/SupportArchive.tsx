import React, { useContext, useState } from "react";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
} from "@patternfly/react-core";
import { Either } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { DownloadButton, Phase } from "./Components";

export const SupportArchive: React.FC = () => {
  const { commandResolver, archiveHelper } = useContext(DependencyContext);
  const [phase, setPhase] = useState<Phase>("Default");
  const [error, setError] = useState<null | string>(null);
  const trigger = commandResolver.useGetTrigger<"GetSupportArchive">({
    kind: "GetSupportArchive",
  });

  const onClick = async () => {
    setPhase("Downloading");
    setError(null);
    const result = await trigger();

    if (Either.isLeft(result)) {
      setPhase("Default");
      setError(result.value);
    } else {
      archiveHelper.triggerDownload(result.value);
      setPhase("Default");
    }
  };

  return (
    <>
      <DownloadButton phase={phase} onClick={onClick} />
      {error && (
        <AlertGroup isToast isLiveRegion>
          <Alert
            data-testid="ToastAlert"
            variant="danger"
            title="Something went wrong with downloading the support archive"
            component="h3"
            actionClose={
              <AlertActionCloseButton onClose={() => setError(null)} />
            }
          >
            {error}
          </Alert>
        </AlertGroup>
      )}
    </>
  );
};
