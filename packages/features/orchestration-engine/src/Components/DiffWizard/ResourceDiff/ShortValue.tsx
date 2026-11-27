import React from "react";
import styled from "styled-components";
import { DIFF_TINTS } from "@inmanta/web-console-ui/Utils";
import { DIFF_SIDE_CHANGES, DiffSide, ValueParts } from "./types";

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
  background-color: ${({ $side, $isChanged }) =>
    $isChanged ? DIFF_TINTS[DIFF_SIDE_CHANGES[$side]].background.var : "transparent"};
  color: ${({ $side, $isChanged }) =>
    $isChanged ? DIFF_TINTS[DIFF_SIDE_CHANGES[$side]].text.var : "inherit"};

  mark {
    color: inherit;
    border-radius: var(--pf-t--global--border--radius--small);
    background-color: ${({ $side }) => DIFF_TINTS[DIFF_SIDE_CHANGES[$side]].changedPartBackground.var};
  }
`;
