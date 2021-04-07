import React, { useState } from "react";
import {
  ToolbarFilter,
  Select,
  SelectOption,
  SelectVariant,
} from "@patternfly/react-core";
import { Query, toggleValueInList } from "@/Core";

type AttributeSetSelectionKey =
  | "Active (empty)"
  | "Active (not empty)"
  | "Candidate (empty)"
  | "Candidate (not empty)"
  | "Rollback (empty)"
  | "Rollback (not empty)";

interface Props {
  emptySet: Query.Attributes[];
  notEmptySet: Query.Attributes[];
  updateEmptySet: (set: Query.Attributes[]) => void;
  updateNotEmptySet: (set: Query.Attributes[]) => void;
  isVisible: boolean;
}

export const AttributesFilter: React.FC<Props> = ({
  emptySet,
  notEmptySet,
  updateEmptySet,
  updateNotEmptySet,
  isVisible,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isDisabled = (
    kind: "Empty" | "Not Empty",
    set: "Active" | "Candidate" | "Rollback"
  ) => {
    if (kind === "Empty") {
      return notEmptySet.includes(Query.Attributes[set]);
    }
    return emptySet.includes(Query.Attributes[set]);
  };

  const onAttributeSelect = (event, selection) => {
    const currentEmpty = attributesListToSelection("empty", emptySet);
    const emptyList = attributeSelectionToAttributesList(
      "empty",
      toggleValueInList(selection, currentEmpty)
    );

    const currentNotEmpty = attributesListToSelection("not empty", notEmptySet);

    const notEmptyList = attributeSelectionToAttributesList(
      "not empty",
      toggleValueInList(selection, currentNotEmpty)
    );

    updateEmptySet(emptyList);
    updateNotEmptySet(notEmptyList);
    setIsFilterOpen(false);
  };

  const selections = getAttributeSelectionFromFilter(emptySet, notEmptySet);

  return (
    <ToolbarFilter
      chips={selections}
      // deleteChip={removeChip}
      categoryName="AttributeSet"
      showToolbarItem={isVisible}
    >
      <Select
        variant={SelectVariant.typeaheadMulti}
        typeAheadAriaLabel="Select a state"
        onToggle={setIsFilterOpen}
        onSelect={onAttributeSelect}
        selections={selections}
        isOpen={isFilterOpen}
        placeholderText="Any"
        chipGroupProps={{ numChips: 0 }}
      >
        <SelectOption
          key={0}
          value="Active (empty)"
          isDisabled={isDisabled("Empty", "Active")}
        />
        <SelectOption
          key={1}
          value="Candidate (empty)"
          isDisabled={isDisabled("Empty", "Candidate")}
        />
        <SelectOption
          key={2}
          value="Rollback (empty)"
          isDisabled={isDisabled("Empty", "Rollback")}
        />
        <SelectOption
          key={3}
          value="Active (not empty)"
          isDisabled={isDisabled("Not Empty", "Active")}
        />
        <SelectOption
          key={4}
          value="Candidate (not empty)"
          isDisabled={isDisabled("Not Empty", "Candidate")}
        />
        <SelectOption
          key={5}
          value="Rollback (not empty)"
          isDisabled={isDisabled("Not Empty", "Rollback")}
        />
      </Select>
    </ToolbarFilter>
  );
};

function getAttributeSelectionFromFilter(
  emptySet: Query.Attributes[],
  notEmptySet: Query.Attributes[]
): AttributeSetSelectionKey[] {
  return [
    ...attributesListToSelection("empty", emptySet),
    ...attributesListToSelection("not empty", notEmptySet),
  ];
}

function attributesListToSelection(
  kind: "empty" | "not empty",
  list: Query.Attributes[]
): AttributeSetSelectionKey[] {
  return list.map((a) => {
    switch (a) {
      case Query.Attributes.Active:
        return `Active (${kind})` as AttributeSetSelectionKey;
      case Query.Attributes.Candidate:
        return `Candidate (${kind})` as AttributeSetSelectionKey;
      case Query.Attributes.Rollback:
        return `Rollback (${kind})` as AttributeSetSelectionKey;
    }
  });
}

function attributeSelectionToAttributesList(
  kind: "empty" | "not empty",
  list: AttributeSetSelectionKey[]
): Query.Attributes[] {
  if (list.length <= 0) return [];
  return list
    .map((value) => attributeToSelection(value))
    .filter(([, k]) => k === kind)
    .map(([attr]) => attr);
}

function attributeToSelection(
  selection: AttributeSetSelectionKey
): [Query.Attributes, "empty" | "not empty"] {
  switch (selection) {
    case "Active (empty)":
      return [Query.Attributes.Active, "empty"];
    case "Active (not empty)":
      return [Query.Attributes.Active, "not empty"];
    case "Candidate (empty)":
      return [Query.Attributes.Candidate, "empty"];
    case "Candidate (not empty)":
      return [Query.Attributes.Candidate, "not empty"];
    case "Rollback (empty)":
      return [Query.Attributes.Rollback, "empty"];
    case "Rollback (not empty)":
      return [Query.Attributes.Rollback, "not empty"];
  }
}
