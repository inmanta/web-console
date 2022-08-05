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
  const trigger = commandResolver.getTrigger<"GetSupportArchive">({
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
      setPhase("Generating");
      const blob = await archiveHelper.generateBlob(result.value);
      archiveHelper.triggerDownload(blob);
      setPhase("Default");
    }
  };

  return (
    <>
      <DownloadButton phase={phase} onClick={onClick} />
      {error && (
        <AlertGroup isToast isLiveRegion>
          <Alert
            aria-label="ArchiveErrorContainer"
            variant="danger"
            title="Something went wrong with downloading the support archive"
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
