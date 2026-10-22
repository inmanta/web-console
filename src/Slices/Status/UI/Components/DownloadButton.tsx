import React from "react";
import { Button } from "@patternfly/react-core";
import { words } from "@/Core";

interface Props {
  isPending: boolean;
  onClick(): void;
}

export const DownloadButton: React.FC<Props> = ({ isPending, onClick }) => {
  const label = words(
    isPending ? "status.supportArchive.action.downloading" : "status.supportArchive.action.download"
  );

  return (
    <Button
      spinnerAriaValueText={label}
      isLoading={isPending}
      variant="primary"
      onClick={onClick}
      isDisabled={isPending}
      aria-label="DownloadArchiveButton"
    >
      {label}
    </Button>
  );
};
