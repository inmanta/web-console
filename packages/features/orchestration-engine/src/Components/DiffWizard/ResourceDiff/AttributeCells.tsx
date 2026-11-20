import React, { PropsWithChildren } from "react";
import { Content } from "@patternfly/react-core";
import { Td } from "@patternfly/react-table";
import { words } from "@inmanta/web-console-core";
import { AttributeName } from "./AttributeName";
import { ShortValue } from "./ShortValue";
import { getChangedParts, getUnmarkedParts } from "./helpers";
import { DIFF_SIDES, DiffSide } from "./types";

interface Props {
  attributeName: string;
  fromValue: string;
  toValue: string;
  sidesWithValues: DiffSide[];
}

/**
 * The cells of an attribute with a short value: its name, then a cell per side of the diff with
 * the changed part marked. A side without values says so, and the children go under the value of
 * the first side that has one.
 *
 * @props {PropsWithChildren<Props>} props - The component props
 *  @prop {string} attributeName - The name of the attribute
 *  @prop {string} fromValue - The value the diff starts from
 *  @prop {string} toValue - The value the diff goes to
 *  @prop {DiffSide[]} sidesWithValues - The sides that hold values, both unless the resource is added or deleted
 *  @prop {React.ReactNode} [children] - Shown under the value of the first side that has one
 *
 * @returns {React.FC<PropsWithChildren<Props>>} The cells of the attribute
 */
export const AttributeCells: React.FC<PropsWithChildren<Props>> = ({
  attributeName,
  fromValue,
  toValue,
  sidesWithValues,
  children,
}) => {
  const hasBothSides = sidesWithValues.length === DIFF_SIDES.length;
  const parts = getChangedParts(fromValue, toValue);
  const values: Record<DiffSide, string> = { from: fromValue, to: toValue };

  return (
    <>
      <AttributeName scope="row" modifier="breakWord">
        {attributeName}
      </AttributeName>
      {DIFF_SIDES.map((side) => (
        <Td key={side}>
          {sidesWithValues.includes(side) ? (
            <ShortValue
              side={side}
              parts={hasBothSides ? parts[side] : getUnmarkedParts(values[side])}
              isChanged={fromValue !== toValue}
            />
          ) : (
            <Content component="small">{words("desiredState.compare.notPresent")}</Content>
          )}
          {side === sidesWithValues[0] && children}
        </Td>
      ))}
    </>
  );
};
