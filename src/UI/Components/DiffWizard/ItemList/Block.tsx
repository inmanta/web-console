import React, { useState } from "react";
import {
  Bullseye,
  Button,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Divider,
} from "@patternfly/react-core";
import styled from "styled-components";
import { StatusDescriptor } from "@/UI/Components/DiffWizard/JumpToAction/StatusDescriptor";
import { DiffItem, Refs } from "@/UI/Components/DiffWizard/types";
import { words } from "@/UI/words";
import { Entry } from "./Entry";

interface Props {
  item: DiffItem;
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
        aria-label="DiffBlock"
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
          <StyledTitle id="titleId">
            <StyledStatusDescriptor status={item.status} />
            {item.id}
          </StyledTitle>
        </StyledHeader>
        <CardExpandableContent>
          <Divider />
          <Body item={item} />
        </CardExpandableContent>
      </StyledCard>
    </>
  );
};

const Body: React.FC<{ item: DiffItem }> = ({ item }) => {
  switch (item.status) {
    case "deleted":
      return <DeletedBody item={item} />;
    case "unmodified":
      return <UnmodifiedBody />;
    case "added":
    case "modified":
      return <ModifiedBody item={item} />;
    default:
      return null;
  }
};

const DeletedBody: React.FC<{ item: Pick<DiffItem, "entries"> }> = ({
  item,
}) => {
  const [isShown, setIsShown] = useState(false);

  return (
    <StyledBody>
      {isShown ? (
        item.entries.map((entry) => <Entry key={entry.title} {...entry} />)
      ) : (
        <Message>
          {words("desiredState.compare.deleted")}
          <ShowButton onClick={() => setIsShown(true)} variant="link" isInline>
            {words("desiredState.compare.deleted.action")}
          </ShowButton>
        </Message>
      )}
    </StyledBody>
  );
};

const ModifiedBody: React.FC<{ item: Pick<DiffItem, "entries"> }> = ({
  item,
}) => (
  <StyledBody>
    {item.entries.map((entry) => (
      <Entry key={entry.title} {...entry} />
    ))}
  </StyledBody>
);

const UnmodifiedBody: React.FC = () => {
  return (
    <StyledBody>
      <Message>{words("desiredState.compare.unmodified")}</Message>
    </StyledBody>
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

const StyledStatusDescriptor = styled(StatusDescriptor)`
  display: inline-block;
  margin-right: 16px;
`;

const Message = styled(Bullseye)`
  line-height: 29px;
  padding: 16px 0;
`;

const ShowButton = styled(Button)`
  margin-left: 4px;
`;
