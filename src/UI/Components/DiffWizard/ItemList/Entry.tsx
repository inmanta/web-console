import React from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer";
import { Grid, GridItem } from "@patternfly/react-core";
import styled from "styled-components";
import { DiffEntry } from "../types";

export const Entry: React.FC<DiffEntry> = ({ title, fromValue, toValue }) => {
  return (
    <Grid>
      <TitleItem span={2}>{title}</TitleItem>
      <GridItem span={10}>
        <ReactDiffViewer
          showDiffOnly={false}
          styles={{
            marker: { display: "none" },
            wordDiff: { padding: 0 },
            contentText: { lineHeight: "29px !important" },
            line: { display: "flex" },
            content: {
              overflowWrap: "anywhere",
              padding: "0 4px",
            },
          }}
          compareMethod={
            isMultiLine(fromValue) || isMultiLine(toValue)
              ? DiffMethod.WORDS
              : DiffMethod.CHARS
          }
          oldValue={fromValue}
          newValue={toValue}
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
