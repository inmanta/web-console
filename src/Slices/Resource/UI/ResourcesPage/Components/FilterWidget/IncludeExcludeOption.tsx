import React from "react";
import { Button } from "@patternfly/react-core";
import { CheckCircleIcon, CheckIcon, TimesCircleIcon, TimesIcon } from "@patternfly/react-icons";
import { Td, Tr } from "@patternfly/react-table";

/**
 * @interface IncludeExcludeOptionProps
 * @desc Props for IncludeExcludeOption.
 * @property {string} state - The status value rendered in the row.
 * @property {boolean} includeActive - Indicates whether the include toggle is active.
 * @property {boolean} excludeActive - Indicates whether the exclude toggle is active.
 * @property {() => void} onInclude - Handler for activating the include toggle.
 * @property {() => void} onExclude - Handler for activating the exclude toggle.
 */
export interface IncludeExcludeOptionProps {
    state: string;
    includeActive: boolean;
    excludeActive: boolean;
    onInclude: () => void;
    onExclude: () => void;
}

/**
 * @component IncludeExcludeOption
 * @desc Renders a compact table row with toggle controls to include or exclude a single status value.
 * @param {IncludeExcludeOptionProps} props - Component props.
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

