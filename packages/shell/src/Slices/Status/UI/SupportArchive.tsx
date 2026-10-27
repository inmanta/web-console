import React, { useContext } from "react";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useAppAlert } from "@inmanta/web-console-core/Dependency/AppAlertContext";
import { useCreateSupportArchive } from "@inmanta/web-console-core/Queries/Slices/Server";
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
  const { notifyError } = useAppAlert();
  const { mutate, isPending } = useCreateSupportArchive({
    onSuccess: (data) => {
      try {
        archiveHelper.triggerDownload(data);
      } catch (err) {
        notifyError({
          title: words("status.supportArchive.action.downloading.error"),
          message:
            err instanceof Error
              ? err.message
              : words("status.supportArchive.action.download.error"),
        });
      }
    },
    onError: (error) => {
      notifyError({
        title: words("status.supportArchive.action.downloading.error"),
        message: error.message || words("status.supportArchive.action.download.error"),
      });
    },
  });

  const onClick = async () => {
    mutate();
  };

  return <DownloadButton isPending={isPending} onClick={onClick} />;
};
