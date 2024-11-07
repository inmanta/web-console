import React from "react";
import { Button } from "@patternfly/react-core";
import { CheckIcon, PencilAltIcon, TimesIcon } from "@patternfly/react-icons";

export const EnableEditButton: React.FC<{
  onClick: () => void;
  "aria-label": string;
}> = ({ onClick, ...props }) => (
  <Button icon={<PencilAltIcon />} aria-label={props["aria-label"]} onClick={onClick} variant="plain" />
);

export const SubmitEditButton: React.FC<{
  onClick: () => void;
  "aria-label": string;
}> = ({ onClick, ...props }) => (
  <Button icon={<CheckIcon />} aria-label={props["aria-label"]} onClick={onClick} variant="link">
    
  </Button>
);

export const CancelEditButton: React.FC<{
  onClick: () => void;
  "aria-label": string;
}> = ({ onClick, ...props }) => (
  <Button icon={<TimesIcon />} aria-label={props["aria-label"]} onClick={onClick} variant="plain" />
);
