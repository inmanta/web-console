import React from "react";
import { Grid, GridItem } from "@patternfly/react-core";
import { Diff, RemoteData } from "@/Core";
import {
  EmptyJumpToAction,
  JumpToAction,
  LoadingJumpToAction,
} from "./JumpToAction";
import { Versus } from "./Versus";
import { fromResourceToItem } from "./fromResourceToItem";
import { Refs } from "./types";

interface Props extends Diff.Identifiers {
  data: RemoteData.RemoteData<string, Diff.Resource[]>;
  refs: Refs;
}

export const Controls: React.FC<Props> = ({ data, refs, from, to }) => (
  <Grid>
    <GridItem span={2}>
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => <LoadingJumpToAction />,
          failed: () => null,
          success: (resources) =>
            resources.length <= 0 ? (
              <EmptyJumpToAction />
            ) : (
              <JumpToAction
                items={resources.map(fromResourceToItem)}
                refs={refs}
              />
            ),
        },
        data
      )}
    </GridItem>
    <GridItem span={10}>
      <Versus from={from} to={to} />
    </GridItem>
  </Grid>
);
