import React, { useContext } from "react";
import { Link } from "react-router";
import { Button } from "@patternfly/react-core";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import { DiscoveredResource } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ActionsDropdown } from "./Components";

interface Props {
  row: DiscoveredResource;
}

export const DiscoveredResourceRow: React.FC<Props> = ({ row }) => {
  const { routeManager } = useContext(DependencyContext);

  const agent = row.agent;
  const value = row.resource_id_value;
  const type = row.resource_type;

  return (
    <Tbody>
      <Tr aria-label="DiscoveredResourceRow">
        <Td
          dataLabel={words("discovered.column.type")}
          data-testid={words("discovered.column.type")}
          modifier="truncate"
        >
          {type}
        </Td>
        <Td
          dataLabel={words("discovered.column.agent")}
          data-testid={words("discovered.column.agent")}
          modifier="truncate"
        >
          {agent}
        </Td>
        <Td
          dataLabel={words("discovered.column.value")}
          data-testid={words("discovered.column.value")}
          modifier="truncate"
        >
          {value}
        </Td>
        <Td
          dataLabel={words("discovered.column.managed_resource")}
          data-testid={words("discovered.column.managed_resource")}
          width={15}
        ></Td>
        <Td
          dataLabel={words("discovered.column.discovery_resource")}
          data-testid={words("discovered.column.discovery_resource")}
          width={20}
          isActionCell
        >
          <Link
            to={{
              pathname: routeManager.getUrl("DiscoveredResourceDetails", {
                resourceId: row.discovered_resource_id,
              }),
              search: location.search,
            }}
          >
            <Button variant="link">{words("discovered.column.show_details")}</Button>
          </Link>
          <ActionsDropdown
            managedResourceUri={row.managed_resource_uri}
            discoveryResourceUri={row.discovery_resource_uri}
          />
        </Td>
      </Tr>
    </Tbody>
  );
};
