import React from "react";
import { Button } from "@patternfly/react-core";
import { CheckCircleIcon, CheckIcon, TimesCircleIcon, TimesIcon } from "@patternfly/react-icons";
import { Td, Tr } from "@patternfly/react-table";

export interface IncludeExcludeOptionProps {
  state: string;
  includeActive: boolean;
  excludeActive: boolean;
  onInclude: () => void;
  onExclude: () => void;
}

/**
 * The IncludeExcludeOption component.
 *
 * Renders a compact table row with toggle controls to include or exclude a single status value.
 *
 * @Props {IncludeExcludeOptionProps} - Component props.
 *  @prop {string} state - The status value rendered in the row.
 *  @prop {boolean} includeActive - Indicates whether the include toggle is active.
 *  @prop {boolean} excludeActive - Indicates whether the exclude toggle is active.
 *  @prop {() => void} onInclude - Handler for activating the include toggle.
 *  @prop {() => void} onExclude - Handler for activating the exclude toggle.
 *
 * @returns {React.ReactElement} A table row representing the include/exclude toggles.
 */
export const IncludeExcludeOption: React.FC<IncludeExcludeOptionProps> = ({
  state,
  includeActive,
  excludeActive,
  onInclude,
  onExclude,
}) => (
  <Tr key={state}>
    <Td>
      <span className="pf-u-text-nowrap">{state}</span>
    </Td>
    <Td>
      <Button variant="plain" onClick={onInclude} aria-label={`${state}-include-toggle`} isInline>
        <span aria-label={includeActive ? `${state}-include-active` : `${state}-include-inactive`}>
          {includeActive ? (
            <CheckIcon
              color="var(--pf-t--global--icon--color--status--success--default)"
              aria-hidden="true"
            />
          ) : (
            <CheckCircleIcon
              color="var(--pf-t--global--icon--color--disabled)"
              aria-hidden="true"
            />
          )}
        </span>
      </Button>
    </Td>
    <Td>
      <Button variant="plain" onClick={onExclude} aria-label={`${state}-exclude-toggle`} isInline>
        <span aria-label={excludeActive ? `${state}-exclude-active` : `${state}-exclude-inactive`}>
          {excludeActive ? (
            <TimesIcon
              color="var(--pf-t--global--icon--color--status--danger--default)"
              aria-hidden="true"
            />
          ) : (
            <TimesCircleIcon
              color="var(--pf-t--global--icon--color--disabled)"
              aria-hidden="true"
            />
          )}
        </span>
      </Button>
    </Td>
  </Tr>
);
