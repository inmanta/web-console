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
  line-height: var(--pf-t--global--font--size--body--lg);
  font-size: var(--pf-t--global--icon--size--font--md);
  border-radius: var(--pf-t--global--border--radius--tiny);
  text-align: center;
  font-weight: var(--pf-t--global--font--weight--400);
  margin: 1.5px 0;
`;

const Added = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-t--global--color--status--success--default);
  color: var(--pf-t--global--text--color--status--on-success--default);
`;

const Deleted = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-t--global--color--status--danger--default);
  color: var(--pf-t--global--text--color--status--on-danger--default);
`;

const Modified = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-t--global--color--status--warning--default);
  color: var(--pf-t--global--text--color--status--on-warning--default);
`;

const Unmodified = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-t--global--icon--color--disabled);
  color: var(--pf-t--global--icon--color--on-disabled);
`;

const Missing = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-t--global--color--status--info--default);
  color: var(--pf-t--global--text--color--status--on-info--default);
`;
