import React from "react";
import {
  SimpleList,
  SimpleListItem,
  SimpleListProps,
} from "@patternfly/react-core";
import styled from "styled-components";
import { DiffItem, Refs } from "../types";
import { StatusDescriptor } from "./StatusDescriptor";

interface Props {
  items: Pick<DiffItem, "id" | "status">[];
  refs: Refs;
}

export const SummaryList: React.FC<Props> = ({ items, refs }) => {
  const onSelect: SimpleListProps["onSelect"] = (ref, listItemProps) => {
    if (listItemProps.itemId === undefined) return;
    if (refs.current[listItemProps.itemId] === undefined) return;
    refs.current[listItemProps.itemId].scrollIntoView({
      behavior: "smooth",
    });
    refs.current[listItemProps.itemId].focus();
  };

  return (
    <StyledSimpleList onSelect={onSelect} aria-label="Simple List Example">
      {items.map((item) => (
        <SimpleListItem key={item.id} itemId={item.id}>
          <Descriptor {...item} />
        </SimpleListItem>
      ))}
    </StyledSimpleList>
  );
};

const Descriptor: React.FC<Pick<DiffItem, "id" | "status">> = ({
  id,
  status,
}) => {
  return (
    <Container>
      <StyledStatusDescriptor status={status} />
      <Id>{id}</Id>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: stretch;
`;

const StyledStatusDescriptor = styled(StatusDescriptor)`
  margin-right: 8px;
`;

const StyledSimpleList = styled(SimpleList)`
  width: fit-content;
  max-height: 500px;
  overflow: scroll;
`;

const Id = styled.div`
  white-space: pre;
`;
