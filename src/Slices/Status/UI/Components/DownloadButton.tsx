import React from "react";
import { Button } from "@patternfly/react-core";
import { words } from "@/UI/words";

export type Phase = "Default" | "Downloading";

interface Props {
  phase: Phase;
  onClick(): void;
}

export const DownloadButton: React.FC<Props> = ({ phase, onClick }) => {
  return (
    <Button
      spinnerAriaValueText={phaseLabelRecord[phase]}
      isLoading={phase !== "Default"}
      variant="primary"
      onClick={onClick}
      isDisabled={phase !== "Default"}
      aria-label="DownloadArchiveButton"
    >
      {phaseLabelRecord[phase]}
    </Button>
  );
};

const phaseLabelRecord: Record<Phase, string> = {
  Default: words("status.supportArchive.action.download"),
  Downloading: words("status.supportArchive.action.downloading"),
};
