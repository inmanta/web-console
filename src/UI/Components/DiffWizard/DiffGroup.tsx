import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Divider,
} from "@patternfly/react-core";
import styled from "styled-components";
import { Diff } from "@/Core";
import { DiffEntry, DiffEntryInfo } from "./DiffEntry";

export interface DiffGroupInfo {
  id: string;
  status: Diff.Status;
  entries: DiffEntryInfo[];
}

export const DiffGroup: React.FC<DiffGroupInfo> = ({ id, entries }) => {
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
        <StyledTitle id="titleId">{id}</StyledTitle>
      </StyledHeader>
      <CardExpandableContent>
        <Divider />
        <StyledBody>
          {entries.map((detail) => (
            <DiffEntry key={detail.title} {...detail} />
          ))}
        </StyledBody>
      </CardExpandableContent>
    </StyledCard>
  );
};

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
