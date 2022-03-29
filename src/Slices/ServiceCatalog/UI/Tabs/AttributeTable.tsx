import React from "react";
import { Table, TableBody, TableHeader } from "@patternfly/react-table";
import { AttributeModel } from "@/Core";

interface Props {
  attributes: AttributeModel[];
}

export const AttributeTable: React.FunctionComponent<Props> = ({
  attributes,
}) => {
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
        <TableHeader aria-label="TableHeader" />
        <TableBody aria-label="TableBody" />
      </Table>
    );
  }
  return <div>No attributes found for the service</div>;
};
