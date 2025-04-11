import React from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  List,
  ListItem,
} from "@patternfly/react-core";
import styled from "styled-components";
import { EventTypesList } from "@/Core";
import { words } from "@/UI/words";

/**
 * Props interface for the Details component
 *
 */
interface Props {
  event_types: string[];
}

/**
 * Details is a component that displays detailed information about a callback's event types.
 * It shows a grid of cards, each representing an event type with its properties.
 *
 * @props {Props} props - The component props
 * @prop {string[]} event_types - Array of event types associated with the callback
 *
 * @returns {React.FC<Props>} A React component that renders detailed information about callback event types
 */
export const Details: React.FC<Props> = ({ event_types }) => {
  return (
    <DescriptionList>
      <DescriptionListGroup>
        <DescriptionListTerm>{words("catalog.callbacks.eventTypes")}</DescriptionListTerm>
        <DescriptionListDescription>
          <CheckedList all={EventTypesList} available={event_types} />
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};

const CheckedList: React.FC<{ all: string[]; available: string[] }> = ({ all, available }) => (
  <List isPlain>
    {all.map((item) =>
      available.includes(item) ? (
        <ListItem key={item}>{item}</ListItem>
      ) : (
        <StyledListItemStriked key={item}>{item}</StyledListItemStriked>
      )
    )}
  </List>
);

const StyledListItemStriked = styled(ListItem)`
  text-decoration: line-through;
  opacity: 0.4;
`;
