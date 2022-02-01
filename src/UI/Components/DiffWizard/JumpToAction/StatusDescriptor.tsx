import React from "react";
import styled, { css } from "styled-components";
import { Diff } from "@/Core";

export const StatusDescriptor: React.FC<{ status: Diff.Status }> = ({
  status,
}) => {
  switch (status) {
    case "added":
      return <Added>A</Added>;
    case "deleted":
      return <Deleted>D</Deleted>;
    case "modified":
      return <Modified>M</Modified>;
  }
};

const descriptorStyles = css`
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  line-height: 18px;
  font-size: 12px;
  border-radius: 2px;
  text-align: center;
  font-weight: bolder;
  color: white;
  margin: 1.5px 8px;
`;

const Added = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-global--success-color--100);
`;

const Deleted = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-global--danger-color--100);
`;

const Modified = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-global--warning-color--100);
`;
