import React from "react";
import { Button } from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@/UI/words";

export type Phase = "Default" | "Downloading";

interface Props {
  phase: Phase;
  onClick(): void;
}

export const DownloadButton: React.FC<Props> = ({ phase, onClick }) => {
  return (
    <StyledButton
      spinnerAriaValueText={phaseLabelRecord[phase]}
      isLoading={phase !== "Default"}
      variant="primary"
      onClick={onClick}
      isDisabled={phase !== "Default"}
      aria-label="DownloadArchiveButton"
    >
      {phaseLabelRecord[phase]}
    </StyledButton>
  );
};

const phaseLabelRecord: Record<Phase, string> = {
  Default: words("status.supportArchive.action.download"),
  Downloading: words("status.supportArchive.action.downloading"),
};

const StyledButton = styled(Button)`
  width: 32ch;
`;
