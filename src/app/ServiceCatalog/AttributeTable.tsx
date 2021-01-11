import React from "react";
import { IAttributeModel } from "@app/Models/LsmModels";
import { Table, TableBody, TableHeader } from "@patternfly/react-table";

export const AttributeTable: React.FunctionComponent<{
  attributes: IAttributeModel[];
}> = (props) => {
  const attributes = [...props.attributes];
  if (attributes.length > 0) {
    const columns = Object.keys(attributes[0]);
    const rows = attributes.map((attribute) =>
      Object.values(attribute).map((attributeValue) =>
        typeof attributeValue === "object" && attributeValue !== null
          ? JSON.stringify(attributeValue)
          : attributeValue
      )
    );
    return (
      <Table aria-label="Attributes" cells={columns} rows={rows}>
        <TableHeader />
        <TableBody />
      </Table>
    );
  }
  return <div id="no-attributes">No attributes found for the service</div>;
};
