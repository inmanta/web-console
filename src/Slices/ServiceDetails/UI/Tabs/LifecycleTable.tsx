import React from "react";
import { Badge, Tooltip } from "@patternfly/react-core";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
import { LifecycleModel } from "@/Core";

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
        content={
          "This transfer is enabled when " +
          transferRow.config_name +
          " is set to true"
        }
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
              .join(" "),
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
        transferRow.source,
        transferRow.target,
        transferRow.error,
        transferRow.target_operation,
        transferRow.error_operation,
        transferRow.description,
        eventTriggerColumn,
      ],
    };
  });
  return (
    <Table aria-label="Lifecycle" cells={columns} rows={rows}>
      <TableHeader />
      <TableBody />
    </Table>
  );
};
