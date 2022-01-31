import React from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer";
import { Grid, GridItem } from "@patternfly/react-core";
import styled from "styled-components";

export interface DiffEntryInfo {
  title: string;
  source: string;
  target: string;
}

/**
 * When using the CHARS diffmethod, the diff part is pushed to the next line.
 * This is fixable with display: inline; on wordDiff. But it breaks other styling.
 */
export const DiffEntry: React.FC<DiffEntryInfo> = ({
  title,
  source,
  target,
}) => {
  return (
    <Grid>
      <TitleItem span={2}>{title}</TitleItem>
      <GridItem span={10}>
        <ReactDiffViewer
          styles={{
            marker: { display: "none" },
            // wordDiff: { display: "inline-flex" },
            // wordDiff: { display: "inline" },
            wordDiff: { paddingLeft: 0, paddingRight: 0 },
            line: { display: "flex" },
            content: { overflowWrap: "anywhere" },
          }}
          compareMethod={
            isMultiLine(source) || isMultiLine(target)
              ? DiffMethod.WORDS
              : DiffMethod.CHARS
          }
          oldValue={source}
          newValue={target}
          hideLineNumbers={true}
        />
      </GridItem>
    </Grid>
  );
};

const isMultiLine = (value: string): boolean => value.indexOf("\n") >= 0;

const TitleItem = styled(GridItem)`
  line-height: 29px;
  font-size: 1rem;
  padding: 0 4px;
`;
