import React from "react";
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
 * the changed part marked. A side without values says so.
 *
 * @props {Props} props - The component props
 *  @prop {string} attributeName - The name of the attribute
 *  @prop {string} fromValue - The value the diff starts from
 *  @prop {string} toValue - The value the diff goes to
 *  @prop {DiffSide[]} sidesWithValues - The sides that hold values, both unless the resource is added or deleted
 *
 * @returns {React.FC<Props>} The cells of the attribute
 */
export const AttributeCells: React.FC<Props> = ({
  attributeName,
  fromValue,
  toValue,
  sidesWithValues,
}) => {
  const hasBothSides = sidesWithValues.length === DIFF_SIDES.length;
  const parts = getChangedParts(fromValue, toValue);
  const values: Record<DiffSide, string> = { from: fromValue, to: toValue };

  return (
    <>
      <AttributeName scope="rowgroup" modifier="breakWord">
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
        </Td>
      ))}
    </>
  );
};
