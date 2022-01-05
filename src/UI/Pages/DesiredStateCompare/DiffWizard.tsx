import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  SimpleList,
  SimpleListItem,
  SimpleListProps,
} from "@patternfly/react-core";
import styled, { css } from "styled-components";

export type Status = "Added" | "Deleted" | "Modified";

export interface Item {
  id: string;
  status: Status;
}

interface Props {
  items: Item[];
}

export const DiffWizard: React.FC<Props> = ({ items }) => {
  const [selectedResourceId, setSelectedResource] = useState<string | null>(
    items[0].id
  );

  const onSelect: SimpleListProps["onSelect"] = (ref, listItemProps) => {
    setSelectedResource(listItemProps.itemId ? `listItemProps.itemId` : null);
  };

  return (
    <div>
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
      <div>
        {items.map((item) => (
          <ItemDiff key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

const ItemDiff: React.FC<{ item: Item }> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const onExpand = () => setIsExpanded(!isExpanded);
  return (
    <StyledCard isExpanded={isExpanded} isFlat isCompact isRounded>
      <CardHeader
        onExpand={onExpand}
        toggleButtonProps={{
          id: "toggle-button",
          "aria-label": "Details",
          "aria-labelledby": "titleId toggle-button",
          "aria-expanded": isExpanded,
        }}
      >
        <CardTitle id="titleId">{item.id}</CardTitle>
      </CardHeader>
      <CardExpandableContent>
        <CardBody>{item.status}</CardBody>
      </CardExpandableContent>
    </StyledCard>
  );
};

const StyledCard = styled(Card)`
  margin-bottom: 16px;
`;

const Descriptor: React.FC<{ item: Item }> = ({ item }) => {
  return (
    <Container>
      <Id>{item.id}</Id>
      <StatusDescriptor status={item.status} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Id = styled.div``;

const StatusDescriptor: React.FC<{ status: Status }> = ({ status }) => {
  switch (status) {
    case "Added":
      return <Added>A</Added>;
    case "Deleted":
      return <Deleted>D</Deleted>;
    case "Modified":
      return <Modified>M</Modified>;
  }
};

const descriptorStyles = css`
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
