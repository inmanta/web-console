import React from "react";
import styled from "styled-components";
import { DiffSide, ValueParts } from "./types";

interface Props {
  side: DiffSide;
  parts: ValueParts;
  isChanged: boolean;
}

/**
 * A short value in the attribute table, tinted red on the from side and green on the to side,
 * with the part that differs from the other side marked.
 *
 * @props {Props} props - The component props
 *  @prop {DiffSide} side - The side of the diff the value is on
 *  @prop {ValueParts} parts - The value, split around the part that differs from the other side
 *  @prop {boolean} isChanged - Whether the value differs from the other side; equal values stay untinted
 *
 * @returns {React.FC<Props>} The value
 */
export const ShortValue: React.FC<Props> = ({ side, parts, isChanged }) => (
  <Value $side={side} $isChanged={isChanged}>
    {parts.commonStart}
    {parts.changed && <mark>{parts.changed}</mark>}
    {parts.commonEnd}
  </Value>
);

const Value = styled.span<{ $side: DiffSide; $isChanged: boolean }>`
  display: block;
  font-family: var(--pf-t--global--font--family--mono);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  padding: 0 var(--pf-t--global--spacer--xs);
  border-radius: var(--pf-t--global--border--radius--small);
  background-color: ${({ $side, $isChanged }) => {
    if (!$isChanged) {
      return "transparent";
    }

    return $side === "from"
      ? "var(--pf-t--global--color--nonstatus--red--default)"
      : "var(--pf-t--global--color--nonstatus--green--default)";
  }};
  color: ${({ $side, $isChanged }) => {
    if (!$isChanged) {
      return "inherit";
    }

    return $side === "from"
      ? "var(--pf-t--global--text--color--nonstatus--on-red--default)"
      : "var(--pf-t--global--text--color--nonstatus--on-green--default)";
  }};

  mark {
    color: inherit;
    border-radius: var(--pf-t--global--border--radius--small);
    background-color: ${({ $side }) =>
      $side === "from"
        ? "var(--pf-t--global--color--nonstatus--red--hover)"
        : "var(--pf-t--global--color--nonstatus--green--hover)"};
  }
`;
