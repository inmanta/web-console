import React from "react";
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { EntryInfo } from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/types";
import { DiffView } from "./DiffView";

/**
 * A changed attribute, as a group of a description list: its name on top, with the diff of its
 * values underneath at full width.
 *
 * @props {EntryInfo} props - The component props
 *  @prop {string} title - The name of the attribute
 *  @prop {string} fromValue - The value before
 *  @prop {string} toValue - The value after
 *
 * @returns {React.FC<EntryInfo>} The entry
 */
export const DefaultEntry: React.FC<EntryInfo> = ({ title, fromValue: from, toValue: to }) => (
  <DescriptionListGroup>
    <DescriptionListTerm>{title}</DescriptionListTerm>
    <DescriptionListDescription>
      <DiffView {...{ from, to }} />
    </DescriptionListDescription>
  </DescriptionListGroup>
);
