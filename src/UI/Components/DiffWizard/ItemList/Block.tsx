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
import { DiffItem, Refs } from "../types";
import { Entry } from "./Entry";

interface Props {
  item: Pick<DiffItem, "id" | "entries">;
  refs: Refs;
}

export const Block: React.FC<Props> = ({ item, refs }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const onExpand = () => setIsExpanded(!isExpanded);

  return (
    <>
      <ScrollAnchor
        ref={(element) =>
          element ? (refs.current[item.id] = element) : undefined
        }
      />
      <StyledCard
        isExpanded={isExpanded}
        isFlat
        isCompact
        isRounded
        aria-label="DiffGroup"
      >
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
            {item.entries.map((entry) => (
              <Entry key={entry.title} {...entry} />
            ))}
          </StyledBody>
        </CardExpandableContent>
      </StyledCard>
    </>
  );
};

/**
 * @NOTE Hack for scrollIntoView behaviour not working correctly.
 * 100px = 84px (overlapped toolbar) + 16px (padding)
 */
const ScrollAnchor = styled.div`
  position: relative;
  top: -100px;
`;

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

const StyledTitle = styled(CardTitle)`
  --pf-c-card__title--FontSize: 0.8rem;
`;

const StyledHeader = styled(CardHeader)`
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
