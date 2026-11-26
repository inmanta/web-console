import React, { useId } from "react";
import { ToggleGroup, ToggleGroupItem } from "@patternfly/react-core";
import { words } from "@inmanta/web-console-core";
import { StructuredJsonView } from "./types";

interface Props {
  view: StructuredJsonView;
  onChange: (view: StructuredJsonView) => void;
  "aria-label": string;
  isCompact?: boolean;
}

/**
 * The Structured / JSON toggle above data that can show either way.
 *
 * @props {Props} props - The component props
 *  @prop {StructuredJsonView} view - The selected view
 *  @prop {(view: StructuredJsonView) => void} onChange - Called with the view to show
 *  @prop {string} aria-label - Names what the toggle switches the view of
 *  @prop {boolean} [isCompact] - Whether the toggle is the compact variant
 *
 * @returns {React.FC<Props>} The view toggle
 */
export const StructuredJsonToggle: React.FC<Props> = ({
  view,
  onChange,
  "aria-label": ariaLabel,
  isCompact,
}) => {
  const buttonIdPrefix = useId();

  return (
    <ToggleGroup isCompact={isCompact} aria-label={ariaLabel}>
      <ToggleGroupItem
        text={words("view.structured")}
        buttonId={`${buttonIdPrefix}-structured`}
        isSelected={view === "structured"}
        onChange={() => onChange("structured")}
      />
      <ToggleGroupItem
        text={words("view.json")}
        buttonId={`${buttonIdPrefix}-json`}
        isSelected={view === "json"}
        onChange={() => onChange("json")}
      />
    </ToggleGroup>
  );
};
