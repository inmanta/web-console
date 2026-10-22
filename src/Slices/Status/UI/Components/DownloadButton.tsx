import React from "react";
import { Button } from "@patternfly/react-core";
import { words } from "@/Core";

export type Phase = "Default" | "Downloading";

interface Props {
  isPending: boolean;
  onClick(): void;
}

export const DownloadButton: React.FC<Props> = ({ isPending, onClick }) => {
  const label = isPending ? getPhaseLabelRecord()["Downloading"] : getPhaseLabelRecord()["Default"];

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

const getPhaseLabelRecord = (): Record<Phase, string> => ({
  Default: words("status.supportArchive.action.download"),
  Downloading: words("status.supportArchive.action.downloading"),
});
