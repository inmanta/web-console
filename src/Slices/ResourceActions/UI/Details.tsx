import React from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { CodeText } from "@/UI/Components";
import { CustomDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { ResourceAction } from "@S/ResourceActions/Core/Domain";

interface Props {
  action: ResourceAction;
}

const datePresenter = new CustomDatePresenter();

/**
 * The expanded content of a changelog row: the action's log messages plus the
 * remaining fields of the resource action.
 *
 * @props {Props} props - The props of the component.
 *  @prop {ResourceAction} action - The resource action to detail.
 * @returns {React.FC<Props>} The details component.
 */
export const Details: React.FC<Props> = ({ action }) => {
  const messages = action.messages ?? [];

  return (
    <Stack hasGutter>
      <StackItem>
        <DescriptionList isHorizontal isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("resourceActions.column.actionId")}</DescriptionListTerm>
            <DescriptionListDescription>
              <CodeText>{action.action_id}</CodeText>
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("resourceActions.column.version")}</DescriptionListTerm>
            <DescriptionListDescription>{action.version}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("resourceActions.column.status")}</DescriptionListTerm>
            <DescriptionListDescription>{action.status ?? "-"}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("resourceActions.column.resources")}</DescriptionListTerm>
            <DescriptionListDescription>
              {action.resource_version_ids.map((id) => (
                <div key={id}>
                  <CodeText>{id}</CodeText>
                </div>
              ))}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
      <StackItem>
        <Table aria-label="ResourceAction-Messages" variant="compact" borders={false}>
          <Thead>
            <Tr>
              <Th width={20}>{words("resourceActions.column.timestamp")}</Th>
              <Th width={10}>{words("resources.logs.logLevel")}</Th>
              <Th>{words("resources.logs.message")}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {messages.length <= 0 ? (
              <Tr>
                <Td colSpan={3}>{words("resourceActions.messages.empty")}</Td>
              </Tr>
            ) : (
              messages.map((message, index) => (
                <Tr key={`${message.timestamp}-${index}`}>
                  <Td modifier="fitContent">{datePresenter.getFull(message.timestamp)}</Td>
                  <Td modifier="fitContent">{message.level}</Td>
                  <Td>
                    <CodeText>{message.msg}</CodeText>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </StackItem>
    </Stack>
  );
};
