import React, { useState } from "react";
import {
  ToolbarFilter,
  Select,
  SelectOption,
  SelectVariant,
  ToolbarItem,
} from "@patternfly/react-core";
import { Query, toggleValueInList } from "@/Core";
import { remove } from "lodash";

type PrettyIdentifier = "Active" | "Candidate" | "Rollback";

function identifierToPrettyIdentifier(
  identifier: Query.Attributes
): PrettyIdentifier {
  switch (identifier) {
    case Query.Attributes.Active:
      return "Active";
    case Query.Attributes.Candidate:
      return "Candidate";
    case Query.Attributes.Rollback:
      return "Rollback";
  }
}

type AttributeSetSelectionKey =
  | "Active (empty)"
  | "Active (not empty)"
  | "Candidate (empty)"
  | "Candidate (not empty)"
  | "Rollback (empty)"
  | "Rollback (not empty)";

interface IdentifierSelectorProps {
  identifierFilter: Query.Attributes | undefined;
  setIdentifierFilter: (id: Query.Attributes) => void;
}

const IdentifierSelector: React.FC<IdentifierSelectorProps> = ({
  identifierFilter,
  setIdentifierFilter,
}) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    setIdentifierFilter(selection);
    setFilterOpen(false);
  };

  return (
    <ToolbarItem>
      <Select
        variant={SelectVariant.single}
        aria-label="Select Identifier"
        onToggle={setFilterOpen}
        onSelect={onSelect}
        selections={identifierFilter}
        isOpen={isFilterOpen}
        placeholderText="Select Identifier"
      >
        <SelectOption key={1} value={Query.Attributes.Candidate}>
          Candidate
        </SelectOption>
        <SelectOption key={2} value={Query.Attributes.Active}>
          Active
        </SelectOption>
        <SelectOption key={3} value={Query.Attributes.Rollback}>
          Rollback
        </SelectOption>
      </Select>
    </ToolbarItem>
  );
};

interface QualitySelectorProps {
  qualityFilter: Quality | undefined;
  setQualityFilter: (q: Quality) => void;
  isDisabled: boolean;
}

type Quality = "empty" | "not empty";

const QualitySelector: React.FC<QualitySelectorProps> = ({
  qualityFilter,
  setQualityFilter,
  isDisabled,
}) => {
  const [isFilterOpen, setFilterOpen] = useState(false);

  const onSelect = (event, selection) => {
    setQualityFilter(selection);
    setFilterOpen(false);
  };

  return (
    <ToolbarItem>
      <Select
        variant={SelectVariant.single}
        aria-label="Select Quality"
        onToggle={setFilterOpen}
        onSelect={onSelect}
        selections={qualityFilter}
        isOpen={isFilterOpen}
        placeholderText={"Select Quality"}
        isDisabled={isDisabled}
      >
        <SelectOption key={0} value="empty">
          Empty
        </SelectOption>
        <SelectOption key={1} value="not empty">
          Not Empty
        </SelectOption>
      </Select>
    </ToolbarItem>
  );
};

interface Props {
  emptySet: Query.Attributes[];
  notEmptySet: Query.Attributes[];
  update: (empty: Query.Attributes[], notEmpty: Query.Attributes[]) => void;

  isVisible: boolean;
}

export const AttributesFilter: React.FC<Props> = ({
  emptySet,
  notEmptySet,
  update,
  isVisible,
}) => {
  const [identifierFilter, setIdentifierFilter] = useState<
    Query.Attributes | undefined
  >(undefined);

  const onSelect = (quality: Quality) => {
    if (typeof identifierFilter === "undefined") return;

    const selection = `${identifierToPrettyIdentifier(
      identifierFilter
    )} (${quality})` as AttributeSetSelectionKey;

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

    if (quality === "empty") {
      remove(notEmptyList, (a) => a === identifierFilter);
    } else if (quality === "not empty") {
      remove(emptyList, (a) => a === identifierFilter);
    }

    update(emptyList, notEmptyList);

    // Reset input fields
    setIdentifierFilter(undefined);
  };

  const removeChip = (category, value) => {
    update(...removePrettyFromList(value, emptySet, notEmptySet));
  };

  return (
    <ToolbarFilter
      chips={getChips(emptySet, notEmptySet)}
      deleteChip={removeChip}
      categoryName="AttributeSet"
      showToolbarItem={isVisible}
    >
      <IdentifierSelector
        identifierFilter={identifierFilter}
        setIdentifierFilter={setIdentifierFilter}
      />
      <QualitySelector
        qualityFilter={getQualityForIdentifier(
          identifierFilter,
          emptySet,
          notEmptySet
        )}
        setQualityFilter={onSelect}
        isDisabled={typeof identifierFilter === "undefined"}
      />
    </ToolbarFilter>
  );
};

function removePrettyFromList(
  pretty: AttributeSetSelectionKey,
  emptySet: Query.Attributes[],
  notEmptySet: Query.Attributes[]
): [Query.Attributes[], Query.Attributes[]] {
  switch (pretty) {
    case "Active (empty)": {
      const l = [...emptySet];
      remove(l, (a) => a === Query.Attributes.Active);
      return [l, notEmptySet];
    }
    case "Active (not empty)": {
      const l = [...notEmptySet];
      remove(l, (a) => a === Query.Attributes.Active);
      return [emptySet, l];
    }

    case "Candidate (empty)": {
      const l = [...emptySet];
      remove(l, (a) => a === Query.Attributes.Candidate);
      return [l, notEmptySet];
    }

    case "Candidate (not empty)": {
      const l = [...notEmptySet];
      remove(l, (a) => a === Query.Attributes.Candidate);
      return [emptySet, l];
    }

    case "Rollback (empty)": {
      const l = [...emptySet];
      remove(l, (a) => a === Query.Attributes.Rollback);
      return [l, notEmptySet];
    }

    case "Rollback (not empty)": {
      const l = [...notEmptySet];
      remove(l, (a) => a === Query.Attributes.Rollback);
      return [emptySet, l];
    }
  }
}

function getChips(
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
    .map((value) => selectionToPair(value))
    .filter(([, k]) => k === kind)
    .map(([attr]) => attr);
}

function selectionToPair(
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

function getQualityForIdentifier(
  identifier: Query.Attributes | undefined,
  setEmpty: Query.Attributes[],
  setNotEmpty: Query.Attributes[]
): Quality | undefined {
  if (typeof identifier === "undefined") return undefined;
  if (setEmpty.includes(identifier)) return "empty";
  if (setNotEmpty.includes(identifier)) return "not empty";
  return undefined;
}
