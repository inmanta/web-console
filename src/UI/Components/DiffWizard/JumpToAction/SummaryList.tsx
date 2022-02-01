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
    <SimpleList onSelect={onSelect} aria-label="Simple List Example">
      {items.map((item) => (
        <SimpleListItem key={item.id} itemId={item.id}>
          <Descriptor {...item} />
        </SimpleListItem>
      ))}
    </SimpleList>
  );
};

const Descriptor: React.FC<Pick<DiffItem, "id" | "status">> = ({
  id,
  status,
}) => {
  return (
    <Container>
      <div>{id}</div>
      <StatusDescriptor status={status} />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  align-items: stretch;
`;
