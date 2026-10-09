import React from "react";
import { Badge, Tooltip } from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { LifecycleModel, StateModel } from "@/Core";
import { InstanceStateLabel } from "@/UI/Components/InstanceState";

/**
 * Renders a state name as a resolved `InstanceStateLabel` (web_label/web_icon/
 * web_description, issue #7094) when it matches a known lifecycle state, falling
 * back to the raw name (e.g. `null` error targets aren't real states).
 *
 * @param {string | null} stateName - the state name to resolve
 * @param {StateModel[]} states - the lifecycle's known states
 * @returns {React.ReactNode} the resolved state presentation
 */
const renderState = (stateName: string | null, states: StateModel[]): React.ReactNode => {
  if (!stateName) {
    return stateName;
  }

  const state = states.find((candidate) => candidate.name === stateName);

  if (!state) {
    return stateName;
  }

  return (
    <InstanceStateLabel name={state.name} label={state.label} annotations={state.annotations} />
  );
};

export const LifecycleTable: React.FunctionComponent<{
  lifecycle: LifecycleModel;
}> = (props) => {
  const columns = [
    "Source",
    "Target",
    "Error",
    "Target Operation",
    "Error Operation",
    "Description",
    "Event trigger",
  ];
  const eventTriggerColumnNames = [
    "api_set_state",
    "resource_based",
    "auto",
    "on_update",
    "on_delete",
  ];

  const rows = props.lifecycle.transfers.map((transferRow) => {
    const validate = transferRow.validate ? (
      <Tooltip
        key={"validate-tooltip"}
        content="This transfer goes to error target when validation fails."
      >
        <Badge key={"validate"} isRead={!transferRow.validate}>
          {"Validate"}
        </Badge>
      </Tooltip>
    ) : (
      ""
    );

    const config = transferRow.config_name ? (
      <Tooltip
        key={"config-tooltip"}
        content={"This transfer is enabled when " + transferRow.config_name + " is set to true"}
      >
        <Badge key={"config_name"} isRead={!transferRow.config_name}>
          {transferRow.config_name}
        </Badge>
      </Tooltip>
    ) : (
      ""
    );

    const eventTrigger = (
      <Badge key={"trigger-label"}>
        {eventTriggerColumnNames
          .filter((name) => transferRow[name])
          .map((trigger) =>
            trigger
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
              .join(" ")
          )}
      </Badge>
    );
    const eventTriggerColumn = (
      <React.Fragment>
        {validate} {config} {eventTrigger}
      </React.Fragment>
    );

    return {
      cells: [
        renderState(transferRow.source, props.lifecycle.states),
        renderState(transferRow.target, props.lifecycle.states),
        renderState(transferRow.error, props.lifecycle.states),
        transferRow.target_operation,
        transferRow.error_operation,
        transferRow.description,
        eventTriggerColumn,
      ],
      key: transferRow.config_name,
    };
  });

  return (
    <Table aria-label="Lifecycle">
      <Thead>
        <Tr>
          {columns.map((column: string) => (
            <Th key={column}>{column}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row) => (
          <Tr key={row.key}>
            {row.cells.map((cell, index) => (
              <Td key={`${row.key}${index}`}>{cell}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
