import React, { useContext } from "react";
import { useCreateSupportArchive } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
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
        notifyError(
          "Something went wrong with downloading the support archive",
          err instanceof Error ? err.message : "Failed to download support archive"
        );
      }
    },
    onError: (error) => {
      notifyError(
        "Something went wrong with downloading the support archive",
        error.message || "Failed to download support archive"
      );
    },
  });

  const onClick = async () => {
    mutate();
  };

  return <DownloadButton isPending={isPending} onClick={onClick} />;
};
