import React from "react";
import { Skeleton } from "@patternfly/react-core";
import { Tr, Td } from "@patternfly/react-table";
import { range } from "lodash-es";
import styled from "styled-components";
import { RequiresTableWrapper } from "./RequiresTableWrapper";

interface Props {
  numberOfRows: number;
}

export const LoadingRequiresTable: React.FC<Props> = ({
  numberOfRows,
  ...props
}) => (
  <RequiresTableWrapper {...props}>
    {range(numberOfRows).map((num) => (
      <Tr key={num}>
        <Td>
          <StyledSkeleton />
        </Td>
        <Td width={15}>
          <StyledSkeleton />
        </Td>
      </Tr>
    ))}
  </RequiresTableWrapper>
);

const StyledSkeleton = styled(Skeleton)`
  height: 36px;
`;
