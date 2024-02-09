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
import { Maybe, Resource } from "@/Core";
import { StatusDescriptor } from "@/UI/Components/DiffWizard/StatusDescriptor";
import { Classification, Item, Refs } from "@/UI/Components/DiffWizard/types";
import { words } from "@/UI/words";
import { Entry } from "./Entry/Entry";

type Classify = (
  title: string,
  entryTitle: string,
  from: string,
  to: string,
) => Classification;

interface Props {
  item: Item;
  refs: Refs;
  classify?: Classify;
}

export const Block: React.FC<Props> = ({ item, refs, classify }) => {
  const [isExpanded, setIsExpanded] = useState(false);
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
        data-testid="DiffBlock"
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
          <Body item={item} classify={classify} />
        </CardExpandableContent>
      </StyledCard>
    </>
  );
};

const Body: React.FC<{ item: Item; classify?: Classify }> = ({
  item,
  classify,
}) => {
  switch (item.status) {
    case "deleted":
      return (
        <BodyWithToggle
          item={item}
          message={words("desiredState.compare.deleted")}
          actionLabel={words("desiredState.compare.deleted.action")}
          classify={classify}
        />
      );
    case "added":
    case "modified":
      return <BodyWithChanges item={item} classify={classify} />;

    case "unmodified":
      return (
        <BodyWithMessage message={words("desiredState.compare.unmodified")} />
      );
    case "agent_down": {
      const agent = Maybe.withFallback(
        Resource.IdParser.getAgentName(item.id),
        "???",
      );
      return (
        <BodyWithMessage
          message={words("desiredState.compare.agent_down")(agent)}
        />
      );
    }

    case "undefined":
      return (
        <BodyWithMessage message={words("desiredState.compare.undefined")} />
      );
    case "skipped_for_undefined":
      return (
        <BodyWithMessage
          message={words("desiredState.compare.skipped_for_undefined")}
        />
      );
    default:
      return null;
  }
};

const BodyWithToggle: React.FC<{
  item: Item;
  message: string;
  actionLabel: string;
  classify?: Classify;
}> = ({ item, message, actionLabel, classify }) => {
  const [isShown, setIsShown] = useState(false);
  return isShown ? (
    <BodyWithChanges {...{ item, classify }} />
  ) : (
    <StyledBody>
      <Message>
        {message}
        <ShowButton onClick={() => setIsShown(true)} variant="link" isInline>
          {actionLabel}
        </ShowButton>
      </Message>
    </StyledBody>
  );
};

const BodyWithChanges: React.FC<{
  item: Pick<Item, "entries" | "id">;
  classify?: Classify;
}> = ({ item, classify }) => (
  <StyledBody>
    {item.entries.map((entry) => (
      <Entry
        key={entry.title}
        {...entry}
        classify={
          classify
            ? (title, to, from) => classify(item.id, title, to, from)
            : undefined
        }
      />
    ))}
  </StyledBody>
);

const BodyWithMessage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <StyledBody>
      <Message>{message}</Message>
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
  --pf-v5-c-card__title--FontSize: 0.8rem;
`;

const StyledHeader = styled(CardHeader)`
  --pf-v5-c-card--first-child--PaddingTop: 8px;
  --pf-v5-c-card--child--PaddingRight: 16px;
  --pf-v5-c-card--child--PaddingBottom: 8px;
  --pf-v5-c-card--child--PaddingLeft: 16px;
`;

const StyledBody = styled(CardBody)`
  --pf-v5-c-card--child--PaddingRight: 0;
  --pf-v5-c-card--child--PaddingBottom: 0;
  --pf-v5-c-card--child--PaddingLeft: 0;
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
  line-height: 29px;
  margin-left: 4px;
`;
