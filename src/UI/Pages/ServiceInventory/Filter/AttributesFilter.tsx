import React, { useState } from "react";
import { ToolbarFilter, ToolbarItem } from "@patternfly/react-core";
import { Query } from "@/Core";
import { without } from "lodash";
import { IdentifierPicker } from "./IdentifierPicker";
import { QualityPicker, Quality } from "./QualityPicker";

type Pretty =
  | "Active (empty)"
  | "Active (not empty)"
  | "Candidate (empty)"
  | "Candidate (not empty)"
  | "Rollback (empty)"
  | "Rollback (not empty)";

export interface AttributeSets {
  empty: Query.Attributes[];
  notEmpty: Query.Attributes[];
}

interface Raw {
  id: Query.Attributes;
  quality: Quality;
}

interface Props {
  sets: AttributeSets;
  update: (sets: AttributeSets) => void;
  isVisible: boolean;
}

export const AttributesFilter: React.FC<Props> = ({
  sets,
  update,
  isVisible,
}) => {
  const [identifierFilter, setIdentifierFilter] = useState<
    Query.Attributes | undefined
  >(undefined);

  const onQualityChange = (quality: Quality) => {
    if (typeof identifierFilter === "undefined") return;

    update(
      createNewSets(sets, {
        id: identifierFilter,
        quality,
      })
    );

    // Reset input fields
    setIdentifierFilter(undefined);
  };

  const removeChip = (category, value) => {
    const { empty, notEmpty } = sets;
    const { id, quality } = prettyToRaw(value as Pretty);
    if (quality === Quality.Empty) {
      update({ notEmpty, empty: without(empty, id) });
    } else {
      update({ empty, notEmpty: without(notEmpty, id) });
    }
  };

  const onIdentifierChange = (identifier: Query.Attributes) => {
    setIdentifierFilter((current) => {
      if (current === identifier) return undefined;
      return identifier;
    });
  };

  return (
    <>
      {isVisible && (
        <ToolbarItem>
          <IdentifierPicker
            identifier={identifierFilter}
            onChange={onIdentifierChange}
          />
        </ToolbarItem>
      )}
      <ToolbarFilter
        chips={getChips(sets)}
        deleteChip={removeChip}
        categoryName="AttributeSet"
        showToolbarItem={isVisible}
      >
        <QualityPicker
          quality={getQualityForIdentifier(sets, identifierFilter)}
          onChange={onQualityChange}
          isDisabled={typeof identifierFilter === "undefined"}
        />
      </ToolbarFilter>
    </>
  );
};

function createNewSets(
  { empty, notEmpty }: AttributeSets,
  { id, quality }: Raw
): AttributeSets {
  switch (quality) {
    case Quality.Empty: {
      if (empty.includes(id)) {
        return {
          empty: without(empty, id),
          notEmpty,
        };
      }

      return {
        empty: [...empty, id],
        notEmpty: without(notEmpty, id),
      };
    }

    case Quality.NotEmpty: {
      if (notEmpty.includes(id)) {
        return {
          empty,
          notEmpty: without(notEmpty, id),
        };
      }

      return {
        empty: without(empty, id),
        notEmpty: [...notEmpty, id],
      };
    }
  }
}

function getChips({ empty, notEmpty }: AttributeSets): Pretty[] {
  const prettyEmpty = empty
    .map((id) => ({ id, quality: Quality.Empty }))
    .map(rawToPretty);
  const prettyNotEmpty = notEmpty
    .map((id) => ({ id, quality: Quality.NotEmpty }))
    .map(rawToPretty);
  return [...prettyEmpty, ...prettyNotEmpty];
}

function rawToPretty({ id, quality }: Raw): Pretty {
  switch (id) {
    case Query.Attributes.Active:
      return quality === Quality.Empty
        ? `Active (empty)`
        : `Active (not empty)`;
    case Query.Attributes.Candidate:
      return quality === Quality.Empty
        ? `Candidate (empty)`
        : `Candidate (not empty)`;
    case Query.Attributes.Rollback:
      return quality === Quality.Empty
        ? `Rollback (empty)`
        : `Rollback (not empty)`;
  }
}

function prettyToRaw(pretty: Pretty): Raw {
  switch (pretty) {
    case "Active (empty)":
      return { id: Query.Attributes.Active, quality: Quality.Empty };
    case "Active (not empty)":
      return { id: Query.Attributes.Active, quality: Quality.NotEmpty };
    case "Candidate (empty)":
      return { id: Query.Attributes.Candidate, quality: Quality.Empty };
    case "Candidate (not empty)":
      return { id: Query.Attributes.Candidate, quality: Quality.NotEmpty };
    case "Rollback (empty)":
      return { id: Query.Attributes.Rollback, quality: Quality.Empty };
    case "Rollback (not empty)":
      return { id: Query.Attributes.Rollback, quality: Quality.NotEmpty };
  }
}

function getQualityForIdentifier(
  { empty, notEmpty }: AttributeSets,
  identifier: Query.Attributes | undefined
): Quality | undefined {
  if (typeof identifier === "undefined") return undefined;
  if (empty.includes(identifier)) return Quality.Empty;
  if (notEmpty.includes(identifier)) return Quality.NotEmpty;
  return undefined;
}
