import React, { useState } from "react";
import {
  SimpleList,
  SimpleListItem,
  SimpleListProps,
} from "@patternfly/react-core";
import styled, { css } from "styled-components";
import { Diff } from "@/Core";

export interface Item {
  id: string;
  status: Diff.Status;
}

interface Props {
  items: Item[];
}

export const ItemIndex: React.FC<Props> = ({ items }) => {
  const [selectedResourceId, setSelectedResource] = useState<string | null>(
    items[0].id
  );

  const onSelect: SimpleListProps["onSelect"] = (ref, listItemProps) => {
    setSelectedResource(listItemProps.itemId ? `listItemProps.itemId` : null);
  };

  return (
    <SimpleList onSelect={onSelect} aria-label="Simple List Example">
      {items.map((item) => (
        <SimpleListItem
          key={item.id}
          isActive={selectedResourceId === item.id}
          itemId={item.id}
        >
          <Descriptor item={item} />
        </SimpleListItem>
      ))}
    </SimpleList>
  );
};

const Descriptor: React.FC<{ item: Item }> = ({ item }) => {
  return (
    <Container>
      {item.id}
      <StatusDescriptor status={item.status} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StatusDescriptor: React.FC<{ status: Diff.Status }> = ({ status }) => {
  switch (status) {
    case "added":
      return <Added>A</Added>;
    case "deleted":
      return <Deleted>D</Deleted>;
    case "modified":
      return <Modified>M</Modified>;
  }
};

const descriptorStyles = css`
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  line-height: 18px;
  font-size: 12px;
  border-radius: 2px;
  text-align: center;
  font-weight: bolder;
  color: white;
  margin: 1.5px 8px;
`;

const Added = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-global--success-color--100);
`;

const Deleted = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-global--danger-color--100);
`;

const Modified = styled.div`
  ${descriptorStyles};
  background-color: var(--pf-global--warning-color--100);
`;
