import React from "react";
import { Button } from "@patternfly/react-core";
import { RhMicronsCaretDownIcon, RhMicronsCaretRightIcon } from "@patternfly/react-icons";

/**
 * The props of the TreeRowToggle component.
 */
interface Props {
  isExpanded: boolean;
  onToggle: () => void;
  "aria-label": string;
}

/**
 * The button that shows or hides the child rows of a tree row.
 * It points right when the child rows are hidden and down when they are shown, like PatternFly's tree toggles.
 *
 * @prop {boolean} isExpanded - Whether the child rows are shown
 * @prop {() => void} onToggle - Called when the button is clicked
 * @prop {string} aria-label - The accessible name of the button
 */
export const TreeRowToggle: React.FC<Props> = ({
  isExpanded,
  onToggle,
  "aria-label": ariaLabel,
}) => (
  <Button
    icon={isExpanded ? <RhMicronsCaretDownIcon /> : <RhMicronsCaretRightIcon />}
    variant="plain"
    aria-label={ariaLabel}
    aria-expanded={isExpanded}
    onClick={onToggle}
  />
);
