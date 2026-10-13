import React, { PropsWithChildren } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { Diff } from "@/Core";
import { EmptyJumpToAction, JumpToAction } from "./JumpToAction";
import { Versus } from "./Versus";
import { fromResourceToItem } from "./fromResourceToItem";
import { Refs } from "./types";

interface Props extends Diff.Identifiers {
  data: Diff.Resource[];
  refs: Refs;
}

/**
 * DiffWizard Controls component
 *
 * This component displays the controls for the DiffWizard in one row: a jump-to action, the two
 * sides of the comparison, and optional content at the end of the row, such as a progress label.
 *
 * @props {PropsWithChildren<Props>} props - The component props
 * @prop {Diff.Resource[]} data - The data to display
 * @prop {Refs} refs - The refs to use
 * @prop {string} from - The from version
 * @prop {string} to - The to version
 * @prop {React.ReactNode} [children] - Shown at the end of the row
 *
 * @returns {React.FC<PropsWithChildren<Props>>} The Controls component
 */
export const Controls: React.FC<PropsWithChildren<Props>> = ({
  data,
  refs,
  from,
  to,
  children,
}) => (
  <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapMd" }}>
    {data.length <= 0 ? (
      <EmptyJumpToAction />
    ) : (
      <JumpToAction items={data.map(fromResourceToItem)} refs={refs} />
    )}
    <Versus from={from} to={to} />
    {children && <FlexItem align={{ default: "alignRight" }}>{children}</FlexItem>}
  </Flex>
);
