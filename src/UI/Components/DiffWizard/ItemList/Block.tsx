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

type Classify = (title: string, entryTitle: string, from: string, to: string) => Classification;

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
        ref={(element) => {
          if (element) {
            refs.current[item.id] = element;
          } else {
            delete refs.current[item.id];
          }
        }}
      />
      <Card isExpanded={isExpanded} isCompact aria-label="DiffBlock" data-testid="DiffBlock">
        <CardHeader
          onExpand={onExpand}
          toggleButtonProps={{
            id: `${item.id}-toggle-button`,
            "aria-label": "Details",
            "aria-labelledby": "toggle-button",
            "aria-expanded": isExpanded,
          }}
        >
          <CardTitle id={item.id}>
            <StatusDescriptor status={item.status} />
            {item.id}
          </CardTitle>
        </CardHeader>
        <CardExpandableContent>
          <Divider />
          <Body item={item} classify={classify} />
        </CardExpandableContent>
      </Card>
    </>
  );
};

const Body: React.FC<{ item: Item; classify?: Classify }> = ({ item, classify }) => {
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
      return <BodyWithMessage message={words("desiredState.compare.unmodified")} />;
    case "agent_down": {
      const agent = Maybe.withFallback(Resource.IdParser.getAgentName(item.id), "???");

      return <BodyWithMessage message={words("desiredState.compare.agent_down")(agent)} />;
    }

    case "undefined":
      return <BodyWithMessage message={words("desiredState.compare.undefined")} />;
    case "skipped_for_undefined":
      return <BodyWithMessage message={words("desiredState.compare.skipped_for_undefined")} />;
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
    <CardBody>
      <Bullseye>
        {message}
        <Button onClick={() => setIsShown(true)} variant="link" isInline>
          {actionLabel}
        </Button>
      </Bullseye>
    </CardBody>
  );
};

const BodyWithChanges: React.FC<{
  item: Pick<Item, "entries" | "id">;
  classify?: Classify;
}> = ({ item, classify }) => (
  <CardBody>
    {item.entries.map((entry) => (
      <Entry
        key={entry.title}
        {...entry}
        classify={classify ? (title, to, from) => classify(item.id, title, to, from) : undefined}
      />
    ))}
  </CardBody>
);

const BodyWithMessage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <CardBody>
      <Bullseye>{message}</Bullseye>
    </CardBody>
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
