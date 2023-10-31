import React from "react";
import styled, { css } from "styled-components";
import { Diff } from "@/Core";

interface Props {
  status: Diff.Status;
  className?: string;
}

export const StatusDescriptor: React.FC<Props> = ({ status, className }) => {
  switch (status) {
    case "added":
      return <Added className={className}>A</Added>;
    case "deleted":
      return <Deleted className={className}>D</Deleted>;
    case "modified":
      return <Modified className={className}>M</Modified>;
    case "unmodified":
      return <Unmodified className={className}>?</Unmodified>;
    case "agent_down":
    case "undefined":
    case "skipped_for_undefined":
      return <Missing className={className}>!</Missing>;
    default:
      return null;
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
  margin: 1.5px 0;
`;

const Added = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-v5-global--success-color--100);
`;

const Deleted = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-v5-global--danger-color--100);
`;

const Modified = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-v5-global--warning-color--100);
`;

const Unmodified = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-v5-global--Color--100);
`;

const Missing = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-v5-global--info-color--100);
`;
