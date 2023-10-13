import React from "react";
import {
  Tbody,
  Table /* data-codemods */,
  TableVariant,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import styled from "styled-components";
import { words } from "@/UI/words";

export const RequiresTableWrapper: React.FC<
  React.PropsWithChildren<unknown>
> = ({ children, ...props }) => (
  <Table aria-label={props["aria-label"]} variant={TableVariant.compact}>
    <Thead>
      <Tr>
        <Th>{words("resources.requires.resource")}</Th>
        <StyledTh width={15}>
          {words("resources.requires.deployState")}
        </StyledTh>
      </Tr>
    </Thead>
    <Tbody>{children}</Tbody>
  </Table>
);

const StyledTh = styled(Th)`
  --pf-v5-c-table--cell--MinWidth: 16ch;
`;
