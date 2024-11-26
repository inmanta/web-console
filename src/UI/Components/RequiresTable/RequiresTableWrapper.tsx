import React from "react";
import {
  Tbody,
  Table,
  TableVariant,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import { words } from "@/UI/words";

export const RequiresTableWrapper: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children, ...props }) => (
  <Table aria-label={props["aria-label"]} variant={TableVariant.compact}>
    <Thead>
      <Tr>
        <Th>{words("resources.requires.resource")}</Th>
        <Th width={15}>{words("resources.requires.deployState")}</Th>
      </Tr>
    </Thead>
    <Tbody>{children}</Tbody>
  </Table>
);
