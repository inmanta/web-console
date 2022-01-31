import React, { useState } from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer";
import {
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Divider,
  Grid,
  GridItem,
} from "@patternfly/react-core";
import styled from "styled-components";

export type Status = "Added" | "Deleted" | "Modified";

interface ItemDetail {
  title: string;
  source: string;
  target: string;
  diff: string;
}

export interface Item {
  id: string;
  status: Status;
  details: ItemDetail[];
}

export const ItemDiff: React.FC<{ item: Item }> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const onExpand = () => setIsExpanded(!isExpanded);

  return (
    <StyledCard isExpanded={isExpanded} isFlat isCompact isRounded>
      <StyledHeader
        onExpand={onExpand}
        toggleButtonProps={{
          id: "toggle-button",
          "aria-label": "Details",
          "aria-labelledby": "titleId toggle-button",
          "aria-expanded": isExpanded,
        }}
      >
        <StyledTitle id="titleId">{item.id}</StyledTitle>
      </StyledHeader>
      <CardExpandableContent>
        <Divider />
        <StyledBody>
          {item.details.map((detail) => (
            <Detail key={detail.title} {...detail} />
          ))}
        </StyledBody>
      </CardExpandableContent>
    </StyledCard>
  );
};

/**
 * When using the CHARS diffmethod, the diff part is pushed to the next line.
 * This is fixable with display: inline; on wordDiff. But it breaks other styling.
 */
const Detail: React.FC<ItemDetail> = ({ title, source, target }) => {
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

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

const StyledTitle = styled(CardTitle)`
  --pf-c-card__title--FontSize: 0.8rem;
`;

const StyledHeader = styled(CardHeader)`
  background-color: var(--pf-global--BackgroundColor--200);
  --pf-c-card--first-child--PaddingTop: 8px;
  --pf-c-card--child--PaddingRight: 16px;
  --pf-c-card--child--PaddingBottom: 8px;
  --pf-c-card--child--PaddingLeft: 16px;
`;

const StyledBody = styled(CardBody)`
  --pf-c-card--child--PaddingRight: 0;
  --pf-c-card--child--PaddingBottom: 0;
  --pf-c-card--child--PaddingLeft: 0;
`;
