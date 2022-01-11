import React, { useState } from "react";
import { ToolbarFilter, ToolbarItem } from "@patternfly/react-core";
import { without } from "lodash-es";
import { ServiceInstanceParams } from "@/Core";
import { AttributeRulePicker, AttributeRule } from "./AttributeRulePicker";
import { AttributeSetPicker } from "./AttributeSetPicker";

type Pretty =
  | "Active (empty)"
  | "Active (not empty)"
  | "Candidate (empty)"
  | "Candidate (not empty)"
  | "Rollback (empty)"
  | "Rollback (not empty)";

export interface AttributeSets {
  empty: ServiceInstanceParams.AttributeSet[];
  notEmpty: ServiceInstanceParams.AttributeSet[];
}

interface Raw {
  id: ServiceInstanceParams.AttributeSet;
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
  const [attributeSetFilter, setAttributeSetFilter] = useState<
    ServiceInstanceParams.AttributeSet | undefined
  >(undefined);

  const onAttributeRuleChange = (rule: AttributeRule) => {
    if (typeof attributeSetFilter === "undefined") return;

    setAttributeSetFilter(undefined);
    update(
      createNewSets(sets, {
        id: attributeSetFilter,
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

  const onAttributeSetChange = (
    attributeSet: ServiceInstanceParams.AttributeSet
  ) => {
    setAttributeSetFilter((current) => {
      if (current === attributeSet) return undefined;
      return attributeSet;
    });
  };

  return (
    <>
      {isVisible && (
        <ToolbarItem>
          <AttributeSetPicker
            attributeSet={attributeSetFilter}
            onChange={onAttributeSetChange}
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
          rule={getRuleForAttributeSet(sets, attributeSetFilter)}
          onChange={onAttributeRuleChange}
          isDisabled={typeof attributeSetFilter === "undefined"}
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
    case ServiceInstanceParams.AttributeSet.Active:
      return rule === AttributeRule.Empty
        ? `Active (empty)`
        : `Active (not empty)`;
    case ServiceInstanceParams.AttributeSet.Candidate:
      return rule === AttributeRule.Empty
        ? `Candidate (empty)`
        : `Candidate (not empty)`;
    case ServiceInstanceParams.AttributeSet.Rollback:
      return rule === AttributeRule.Empty
        ? `Rollback (empty)`
        : `Rollback (not empty)`;
  }
}

function prettyToRaw(pretty: Pretty): Raw {
  switch (pretty) {
    case "Active (empty)":
      return {
        id: ServiceInstanceParams.AttributeSet.Active,
        rule: AttributeRule.Empty,
      };
    case "Active (not empty)":
      return {
        id: ServiceInstanceParams.AttributeSet.Active,
        rule: AttributeRule.NotEmpty,
      };
    case "Candidate (empty)":
      return {
        id: ServiceInstanceParams.AttributeSet.Candidate,
        rule: AttributeRule.Empty,
      };
    case "Candidate (not empty)":
      return {
        id: ServiceInstanceParams.AttributeSet.Candidate,
        rule: AttributeRule.NotEmpty,
      };
    case "Rollback (empty)":
      return {
        id: ServiceInstanceParams.AttributeSet.Rollback,
        rule: AttributeRule.Empty,
      };
    case "Rollback (not empty)":
      return {
        id: ServiceInstanceParams.AttributeSet.Rollback,
        rule: AttributeRule.NotEmpty,
      };
  }
}

function getRuleForAttributeSet(
  { empty, notEmpty }: AttributeSets,
  attributeSet: ServiceInstanceParams.AttributeSet | undefined
): AttributeRule | undefined {
  if (typeof attributeSet === "undefined") return undefined;
  if (empty.includes(attributeSet)) return AttributeRule.Empty;
  if (notEmpty.includes(attributeSet)) return AttributeRule.NotEmpty;
  return undefined;
}
