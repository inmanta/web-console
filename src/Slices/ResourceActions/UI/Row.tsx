import React from "react";
import { Tbody, Td, Tr, ExpandableRowContent } from "@patternfly/react-table";
import { ResourceLink } from "@/UI/Components";
import { CustomDatePresenter } from "@/UI/Utils";
import { getResourceIdFromResourceVersionId } from "@/UI/Utils/ResourceId";
import { words } from "@/UI/words";
import { ResourceAction } from "@S/ResourceActions/Core/Domain";
import { DeployOutcomeLabel } from "./DeployOutcomeLabel";
import { DeployReasonIcon } from "./DeployReasonIcon";
import { DeployStatusLabel } from "./DeployStatusLabel";
import { Details } from "./Details";

interface Props {
  action: ResourceAction;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  index: number;
}

const datePresenter = new CustomDatePresenter();

const getDuration = (action: ResourceAction): string =>
  action.finished ? datePresenter.diff(action.finished, action.started) : "-";

/**
 * A single changelog table row, showing one resource action and an expandable
 * details section.
 *
 * @props {Props} props - The props of the component.
 * @returns {React.FC<Props>} The row component.
 */
export const Row: React.FC<Props> = ({ action, isExpanded, onToggle, numberOfColumns, index }) => {
  const resourceVersionId = action.resource_version_ids[0];

  return (
    <Tbody isExpanded={false} aria-label="ResourceActionRow">
      <Tr>
        <Td
          expand={{
            rowIndex: index,
            isExpanded,
            onToggle,
          }}
        />
        <Td dataLabel={words("resourceActions.column.started")} modifier="fitContent">
          {datePresenter.getFull(action.started)}
        </Td>
        <Td dataLabel={words("resourceActions.column.finished")} modifier="fitContent">
          {action.finished ? datePresenter.getFull(action.finished) : "-"}
        </Td>
        <Td dataLabel={words("resourceActions.column.duration")} modifier="fitContent">
          {getDuration(action)}
        </Td>
        <Td dataLabel={words("resourceActions.column.resource")} modifier="breakWord">
          {resourceVersionId ? (
            <ResourceLink
              resourceId={getResourceIdFromResourceVersionId(resourceVersionId)}
              linkText={resourceVersionId}
            />
          ) : (
            "-"
          )}
        </Td>
        <Td dataLabel={words("resourceActions.column.type")} modifier="fitContent">
          {action.action}
        </Td>
        <Td dataLabel={words("resourceActions.column.status")} modifier="fitContent">
          <DeployStatusLabel status={action.status} />
        </Td>
        <Td dataLabel={words("resourceActions.column.reason")} modifier="fitContent">
          <DeployReasonIcon action={action} />
        </Td>
        <Td dataLabel={words("resourceActions.column.outcome")} modifier="fitContent">
          <DeployOutcomeLabel change={action.change} />
        </Td>
      </Tr>
      {isExpanded && (
        <Tr isExpanded={isExpanded}>
          <Td colSpan={numberOfColumns}>
            <ExpandableRowContent>
              <Details action={action} />
            </ExpandableRowContent>
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};
