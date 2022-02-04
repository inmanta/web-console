import React from "react";
import { Grid, GridItem } from "@patternfly/react-core";
import { Diff, Query, RemoteData } from "@/Core";
import {
  DiffVersus,
  EmptyJumpToAction,
  JumpToAction,
  LoadingJumpToAction,
} from "@/UI/Components";
import { Refs } from "@/UI/Components/DiffWizard/types";
import { resourceToDiffItem } from "./resourceToDiffItem";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.UsedData<K>
>;

interface Props extends Diff.Identifiers {
  data: Data<"GetDesiredStateDiff">;
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
                items={resources.map(resourceToDiffItem)}
                refs={refs}
              />
            ),
        },
        data
      )}
    </GridItem>
    <GridItem span={10}>
      <DiffVersus from={from} to={to} />
    </GridItem>
  </Grid>
);
