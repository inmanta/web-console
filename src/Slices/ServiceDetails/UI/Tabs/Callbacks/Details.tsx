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

interface Props {
  event_types: string[];
}

export const Details: React.FC<Props> = ({ event_types }) => {
  return (
    <StyledDescriptionList>
      <DescriptionListGroup>
        <DescriptionListTerm>
          {words("catalog.callbacks.eventTypes")}
        </DescriptionListTerm>
        <DescriptionListDescription>
          <CheckedList all={EventTypesList} available={event_types} />
        </DescriptionListDescription>
      </DescriptionListGroup>
    </StyledDescriptionList>
  );
};

const StyledDescriptionList = styled(DescriptionList)`
  --pf-v5-c-description-list--m-horizontal__term--width: 20ch;
`;

const CheckedList: React.FC<{ all: string[]; available: string[] }> = ({
  all,
  available,
}) => (
  <List isPlain>
    {all.map((item) =>
      available.includes(item) ? (
        <ListItem key={item}>{item}</ListItem>
      ) : (
        <StyledListItemStriked key={item}>{item}</StyledListItemStriked>
      ),
    )}
  </List>
);

const StyledListItemStriked = styled(ListItem)`
  text-decoration: line-through;
  opacity: 0.4;
`;
