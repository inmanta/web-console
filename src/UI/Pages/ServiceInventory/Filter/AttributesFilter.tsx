import React, { useState } from "react";
import { ToolbarFilter, ToolbarItem } from "@patternfly/react-core";
import { ServiceInstanceParams } from "@/Core";
import { without } from "lodash";
import { IdentifierPicker } from "./IdentifierPicker";
import { AttributeRulePicker, AttributeRule } from "./AttributeRulePicker";

type Pretty =
  | "Active (empty)"
  | "Active (not empty)"
  | "Candidate (empty)"
  | "Candidate (not empty)"
  | "Rollback (empty)"
  | "Rollback (not empty)";

export interface AttributeSets {
  empty: ServiceInstanceParams.Attributes[];
  notEmpty: ServiceInstanceParams.Attributes[];
}

interface Raw {
  id: ServiceInstanceParams.Attributes;
  rule: AttributeRule;
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
    ServiceInstanceParams.Attributes | undefined
  >(undefined);

  const onAttributeRuleChange = (rule: AttributeRule) => {
    if (typeof identifierFilter === "undefined") return;

    setIdentifierFilter(undefined);
    update(
      createNewSets(sets, {
        id: identifierFilter,
        rule,
      })
    );
  };

  const removeChip = (category, value) => {
    const { empty, notEmpty } = sets;
    const { id, rule } = prettyToRaw(value as Pretty);
    if (rule === AttributeRule.Empty) {
      update({ notEmpty, empty: without(empty, id) });
    } else {
      update({ empty, notEmpty: without(notEmpty, id) });
    }
  };

  const onIdentifierChange = (identifier: ServiceInstanceParams.Attributes) => {
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
        <AttributeRulePicker
          rule={getRuleForIdentifier(sets, identifierFilter)}
          onChange={onAttributeRuleChange}
          isDisabled={typeof identifierFilter === "undefined"}
        />
      </ToolbarFilter>
    </>
  );
};

function createNewSets(
  { empty, notEmpty }: AttributeSets,
  { id, rule }: Raw
): AttributeSets {
  switch (rule) {
    case AttributeRule.Empty: {
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

    case AttributeRule.NotEmpty: {
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
    .map((id) => ({ id, rule: AttributeRule.Empty }))
    .map(rawToPretty);
  const prettyNotEmpty = notEmpty
    .map((id) => ({ id, rule: AttributeRule.NotEmpty }))
    .map(rawToPretty);
  return [...prettyEmpty, ...prettyNotEmpty];
}

function rawToPretty({ id, rule }: Raw): Pretty {
  switch (id) {
    case ServiceInstanceParams.Attributes.Active:
      return rule === AttributeRule.Empty
        ? `Active (empty)`
        : `Active (not empty)`;
    case ServiceInstanceParams.Attributes.Candidate:
      return rule === AttributeRule.Empty
        ? `Candidate (empty)`
        : `Candidate (not empty)`;
    case ServiceInstanceParams.Attributes.Rollback:
      return rule === AttributeRule.Empty
        ? `Rollback (empty)`
        : `Rollback (not empty)`;
  }
}

function prettyToRaw(pretty: Pretty): Raw {
  switch (pretty) {
    case "Active (empty)":
      return {
        id: ServiceInstanceParams.Attributes.Active,
        rule: AttributeRule.Empty,
      };
    case "Active (not empty)":
      return {
        id: ServiceInstanceParams.Attributes.Active,
        rule: AttributeRule.NotEmpty,
      };
    case "Candidate (empty)":
      return {
        id: ServiceInstanceParams.Attributes.Candidate,
        rule: AttributeRule.Empty,
      };
    case "Candidate (not empty)":
      return {
        id: ServiceInstanceParams.Attributes.Candidate,
        rule: AttributeRule.NotEmpty,
      };
    case "Rollback (empty)":
      return {
        id: ServiceInstanceParams.Attributes.Rollback,
        rule: AttributeRule.Empty,
      };
    case "Rollback (not empty)":
      return {
        id: ServiceInstanceParams.Attributes.Rollback,
        rule: AttributeRule.NotEmpty,
      };
  }
}

function getRuleForIdentifier(
  { empty, notEmpty }: AttributeSets,
  identifier: ServiceInstanceParams.Attributes | undefined
): AttributeRule | undefined {
  if (typeof identifier === "undefined") return undefined;
  if (empty.includes(identifier)) return AttributeRule.Empty;
  if (notEmpty.includes(identifier)) return AttributeRule.NotEmpty;
  return undefined;
}
