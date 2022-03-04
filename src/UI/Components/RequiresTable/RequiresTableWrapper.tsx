import React from "react";
import {
  Tbody,
  TableComposable,
  TableVariant,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import styled from "styled-components";
import { words } from "@/UI/words";

export const RequiresTableWrapper: React.FC = ({ children, ...props }) => (
  <TableComposable
    aria-label={props["aria-label"]}
    variant={TableVariant.compact}
  >
    <Thead>
      <Tr>
        <Th>{words("resources.requires.resource")}</Th>
        <StyledTh width={15}>
          {words("resources.requires.deployState")}
        </StyledTh>
      </Tr>
    </Thead>
    <Tbody>{children}</Tbody>
  </TableComposable>
);

const StyledTh = styled(Th)`
  --pf-c-table--cell--MinWidth: 16ch;
`;
