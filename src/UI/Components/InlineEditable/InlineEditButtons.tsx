import React from "react";
import { Button } from "@patternfly/react-core";
import { CheckIcon, PencilAltIcon, TimesIcon } from "@patternfly/react-icons";

export const EnableEditButton: React.FC<{
  onClick: () => void;
  "aria-label": string;
}> = ({ onClick, ...props }) => (
  <Button aria-label={props["aria-label"]} onClick={onClick} variant="plain">
    <PencilAltIcon />
  </Button>
);

export const SubmitEditButton: React.FC<{
  onClick: () => void;
  "aria-label": string;
}> = ({ onClick, ...props }) => (
  <Button aria-label={props["aria-label"]} onClick={onClick} variant="link">
    <CheckIcon />
  </Button>
);

export const CancelEditButton: React.FC<{
  onClick: () => void;
  "aria-label": string;
}> = ({ onClick, ...props }) => (
  <Button aria-label={props["aria-label"]} onClick={onClick} variant="plain">
    <TimesIcon />
  </Button>
);
