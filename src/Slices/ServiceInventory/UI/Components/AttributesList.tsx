import React from "react";
import { List, ListItem } from "@patternfly/react-core";
import { Pairs } from "@/Core";

interface Props {
  attributes: Pairs;
}

export const AttributesList: React.FC<Props> = ({ attributes }) => (
  <List role="list">
    {attributes.map(([key, val]) => (
      <ListItem key={key}>
        {key}: {val}
      </ListItem>
    ))}
  </List>
);
