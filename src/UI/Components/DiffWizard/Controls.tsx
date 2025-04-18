import React from "react";
import { Grid, GridItem } from "@patternfly/react-core";
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
 * This component displays the controls for the DiffWizard, including a jump-to action and a versus comparison.
 *
 * @props {Props} props - The component props
 * @prop {Diff.Resource[]} data - The data to display
 * @prop {Refs} refs - The refs to use
 * @prop {string} from - The from version
 * @prop {string} to - The to version
 *
 * @returns {React.FC<Props>} The Controls component
 */
export const Controls: React.FC<Props> = ({ data, refs, from, to }) => (
  <Grid>
    <GridItem span={2}>
      {data.length <= 0 ? (
        <EmptyJumpToAction />
      ) : (
        <JumpToAction items={data.map(fromResourceToItem)} refs={refs} />
      )}
    </GridItem>
    <GridItem span={10}>
      <Versus from={from} to={to} />
    </GridItem>
  </Grid>
);
