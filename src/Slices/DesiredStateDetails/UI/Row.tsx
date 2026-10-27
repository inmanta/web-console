import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { Tbody, Tr, Td } from "@patternfly/react-table";
import { ParsedNumber, words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { Link } from "@inmanta/web-console-ui/Components/Link";

export type RowFromVersion = {
  id: string;
  type: string;
  agent: string;
  value: string;
  numberOfDependencies: ParsedNumber;
};

interface Props {
  row: RowFromVersion;
  version: string;
}

export const Row: React.FC<Props> = ({ row, version }) => {
  const { routeManager } = useContext(DependencyContext);

  return (
    <Tbody>
      <Tr aria-label="Resource Table Row">
        <Td modifier="truncate" dataLabel={words("type")}>
          {row.type}
        </Td>
        <Td modifier="truncate" dataLabel={words("agent")}>
          {row.agent}
        </Td>
        <Td modifier="truncate" dataLabel={words("value")}>
          {row.value}
        </Td>
        <Td dataLabel={words("requires")}>{row.numberOfDependencies as React.ReactNode}</Td>
        <Td modifier="fitContent" isActionCell>
          <Link
            pathname={routeManager.getUrl("DesiredStateResourceDetails", {
              resourceId: row.id,
              version,
            })}
          >
            <Button variant="link">{words("showDetails")}</Button>
          </Link>
        </Td>
      </Tr>
    </Tbody>
  );
};
