import { IServiceInstanceModel } from "@app/Models/LsmModels";
import React from "react";
import {
  TableHeader,
  Table,
  TableBody,
  wrappable,
} from "@patternfly/react-table";
import { List, ListItem } from "@patternfly/react-core";
import moment from "moment";
import { ResourceModal } from "./ResourceModal";
import { InstanceModal, ButtonType } from "./InstanceModal";
import { DiagnosticsModal } from "./DiagnosticsModal";

export const InventoryTable: React.FunctionComponent<{
  instances: IServiceInstanceModel[];
  keycloak?: Keycloak.KeycloakInstance;
}> = (props) => {
  const columnsInOrder = [
    "Id",
    "State",
    { title: "Candidate Attributes", transforms: [wrappable] },
    { title: "Active Attributes", transforms: [wrappable] },
    { title: "Rollback Attributes", transforms: [wrappable] },
    "Version",
    { title: "Last Updated", transforms: [wrappable] },
    "Resources",
    "Actions",
  ];
  const instances = [...props.instances];
  const rows = instances.map((instance) => {
    const activeAttributes = getFormattedListFromObject(
      instance,
      "active_attributes"
    );
    const candidateAttributes = getFormattedListFromObject(
      instance,
      "candidate_attributes"
    );
    const rollbackAttributes = getFormattedListFromObject(
      instance,
      "rollback_attributes"
    );
    const resourceModal = (
      <ResourceModal instance={instance} keycloak={props.keycloak} />
    );
    let actions = <React.Fragment />;
    if (instance.state !== "terminated") {
      actions = (
        <div>
          <InstanceModal
            buttonType={ButtonType.edit}
            serviceName={instance.service_entity}
            instance={instance}
            keycloak={props.keycloak}
          />
          <span className="pf-u-pr-xl pf-u-pl-xl" />
          <InstanceModal
            buttonType={ButtonType.delete}
            serviceName={instance.service_entity}
            instance={instance}
            keycloak={props.keycloak}
          />
          <DiagnosticsModal
            serviceName={instance.service_entity}
            instance={instance}
            keycloak={props.keycloak}
          />
        </div>
      );
    }
    return {
      cells: [
        instance.id.substring(0, 4),
        instance.state,
        candidateAttributes,
        activeAttributes,
        rollbackAttributes,
        instance.version,
        moment(instance.last_updated).format("MMMM Do YYYY, h:mm:ss a"),
        { title: resourceModal, props: { instance } },
        { title: actions },
      ],
    };
  });

  return (
    <React.Fragment>
      <Table
        aria-label="Instances"
        cells={columnsInOrder}
        rows={rows}
        role="table"
        className="table-with-max-cell-width"
      >
        <TableHeader />
        <TableBody rowKey={({ rowIndex }) => rowIndex} />
      </Table>
    </React.Fragment>
  );
};

function getFormattedListFromObject(
  instance: IServiceInstanceModel,
  key: string
) {
  return instance[key] ? (
    <List role="list">
      {Object.keys(instance[key]).map((attribute) => {
        const attributeValue = instance[key][attribute];
        return (
          <ListItem key={attribute}>
            {attribute}:{" "}
            {Array.isArray(attributeValue)
              ? attributeValue
                  .map((element) => JSON.stringify(element))
                  .join(", ")
              : JSON.stringify(attributeValue)}
          </ListItem>
        );
      })}
    </List>
  ) : null;
}
