import React, { useContext, useState } from "react";
import { Alert, AlertActionCloseButton, AlertGroup } from "@patternfly/react-core";
import { useCreateSupportArchive } from "@/Data/Managers/V2/Server";
import { DependencyContext } from "@/UI/Dependency";
import { DownloadButton } from "./Components";

/**
 * SupportArchive component is responsible for managing the download
 * of the support archive. It utilizes the useCreateSupportArchive hook
 * to handle the download process and provides user feedback through
 * a DownloadButton and alerts for any errors that may occur during
 * the download.
 *
 * @returns {React.FC} The rendered component.
 */
export const SupportArchive: React.FC = () => {
  const { archiveHelper } = useContext(DependencyContext);
  const [error, setError] = useState<null | string>(null);
  const { mutate, isPending } = useCreateSupportArchive({
    onSuccess: (data) => {
      try {
        archiveHelper.triggerDownload(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to download support archive");
      }
    },
    onError: (error) => {
      setError(error.message || "Failed to download support archive");
    },
  });

  const onClick = async () => {
    setError(null);
    mutate();
  };

  return (
    <>
      <DownloadButton isPending={isPending} onClick={onClick} />
      {error && (
        <AlertGroup isToast isLiveRegion>
          <Alert
            data-testid="ToastAlert"
            variant="danger"
            title="Something went wrong with downloading the support archive"
            component="h3"
            actionClose={<AlertActionCloseButton onClose={() => setError(null)} />}
          >
            {error}
          </Alert>
        </AlertGroup>
      )}
    </>
  );
};
