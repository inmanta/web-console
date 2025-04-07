import React from "react";
import { Grid, GridItem } from "@patternfly/react-core";
import { EntryInfo } from "@/UI/Components/DiffWizard/types";
import { DiffView } from "./DiffView";
import { Title } from "./utils";

export const DefaultEntry: React.FC<EntryInfo> = ({
  title,
  fromValue: from,
  toValue: to,
}) => (
  <Grid>
    <GridItem span={2}>
      <Title>{title}</Title>
    </GridItem>
    <GridItem span={10}>
      <DiffView {...{ from, to }} />
    </GridItem>
  </Grid>
);
