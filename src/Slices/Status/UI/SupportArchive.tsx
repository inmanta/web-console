import React, { useContext, useState } from "react";
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
} from "@patternfly/react-core";
import { useGetSupportArchive } from "@/Data/Managers/V2/Support/GetSupportArchive";
import { DependencyContext } from "@/UI/Dependency";
import { DownloadButton, Phase } from "./Components";

export const SupportArchive: React.FC = () => {
  const { archiveHelper } = useContext(DependencyContext);
  const [phase, setPhase] = useState<Phase>("Default");
  const [error, setError] = useState<null | string>(null);
  const { mutate } = useGetSupportArchive({
    onSuccess: (data) => {
      try {
        archiveHelper.triggerDownload(data);
        setPhase("Default");
      } catch (err) {
        setPhase("Default");
        setError(
          err instanceof Error
            ? err.message
            : "Failed to download support archive",
        );
      }
    },
    onError: (error) => {
      setPhase("Default");
      setError(error.message || "Failed to download support archive");
    },
  });

  const onClick = async () => {
    setPhase("Downloading");
    setError(null);
    mutate();
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
