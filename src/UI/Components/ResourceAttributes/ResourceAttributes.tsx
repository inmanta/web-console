import React, { useMemo } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { Reference } from "@/Core/Domain";
import { AttributeClassifier, ClassifiedAttribute } from "@/Data/Common/AttributeClassifier";
import {
  collectReplacements,
  extractMutators,
  extractReferences,
  indexReferences,
} from "@/Data/Common/References";
import { AttributeValue } from "@/UI/Components/AttributeList";
import { ReferenceNode, ReplacementList } from "@/UI/Components/References";
import { words } from "@/UI/words";
import { MACHINERY_KEYS, groupReplacements, partitionFramework } from "./helpers";

interface Props {
  attributes: Record<string, unknown>;
  classifier: AttributeClassifier;
  isExpanded: (key: string) => boolean;
  onToggle: (key: string) => () => void;
}

/**
 * The structured view of a resource's attributes. A whole-attribute reference
 * replaces the null with an expandable node; a nested one keeps the value and lists
 * its replacements below. Model and framework attributes get separate cards, and
 * the reference machinery keys are hidden.
 *
 * @prop {Record<string, unknown>} attributes - The raw attributes of the resource.
 * @prop {AttributeClassifier} classifier - Classifies the shown attributes.
 * @prop {(key: string) => boolean} isExpanded - Whether the node at a path is expanded.
 * @prop {(key: string) => () => void} onToggle - Returns the toggle handler for a path.
 */
export const ResourceAttributes: React.FC<Props> = ({
  attributes,
  classifier,
  isExpanded,
  onToggle,
}) => {
  // Derived once per payload, not on every expansion toggle or refetch render.
  const { index, replacementsByKey, model, framework, undisplayedCount } = useMemo(() => {
    const { replacements, undisplayedCount } = collectReplacements(extractMutators(attributes));
    const shownAttributes = Object.fromEntries(
      Object.entries(attributes).filter(([key]) => !MACHINERY_KEYS.includes(key))
    );
    const classified = classifier.classify(shownAttributes);
    const shownKeys = new Set(classified.map((attribute) => attribute.key));
    const orphanedCount = replacements.filter(
      (replacement) => !shownKeys.has(replacement.attributeKey)
    ).length;

    return {
      index: indexReferences(extractReferences(attributes)),
      replacementsByKey: groupReplacements(replacements),
      ...partitionFramework(classified),
      undisplayedCount: undisplayedCount + orphanedCount,
    };
  }, [attributes, classifier]);

  const renderAttribute = (attribute: ClassifiedAttribute) => (
    <DescriptionListGroup key={attribute.key}>
      <DescriptionListTerm>{attribute.key}</DescriptionListTerm>
      <DescriptionListDescription data-testid={`attribute-${attribute.key}`}>
        <AttributeCell
          attribute={attribute}
          replacements={replacementsByKey[attribute.key] ?? []}
          index={index}
          isExpanded={isExpanded}
          onToggle={onToggle}
        />
      </DescriptionListDescription>
    </DescriptionListGroup>
  );

  // The model group is a single column, where a value can be a whole reference tree
  // or a code block. The framework values are short, so they wrap side by side.
  return (
    <Stack hasGutter>
      <StackItem>
        <Card isCompact>
          <CardTitle>{words("resources.attributes.modelGroup")}</CardTitle>
          <CardBody>
            <DescriptionList>{model.map(renderAttribute)}</DescriptionList>
          </CardBody>
        </Card>
      </StackItem>
      {framework.length > 0 && (
        <StackItem>
          <Card isCompact>
            <CardTitle>{words("resources.attributes.frameworkGroup")}</CardTitle>
            <CardBody>
              <Flex gap={{ default: "gap4xl" }} flexWrap={{ default: "wrap" }}>
                {framework.map((attribute) => (
                  <FlexItem key={attribute.key}>
                    <DescriptionList isCompact>{renderAttribute(attribute)}</DescriptionList>
                  </FlexItem>
                ))}
              </Flex>
            </CardBody>
          </Card>
        </StackItem>
      )}
      {undisplayedCount > 0 && (
        <StackItem>
          <HelperText>
            <HelperTextItem variant="indeterminate">
              {words("references.mutatorsNotDisplayed")(undisplayedCount)}
            </HelperTextItem>
          </HelperText>
        </StackItem>
      )}
    </Stack>
  );
};

/**
 * The value cell for one attribute: a whole-attribute reference becomes a node in
 * place of the null; otherwise the value renders as stored, with any nested
 * replacements listed beneath it.
 *
 * @prop {ClassifiedAttribute} attribute - The classified attribute for this cell.
 * @prop {Reference.Replacement[]} replacements - Replacements targeting this attribute.
 * @prop {Reference.ReferenceIndex} index - Lookup from reference id to normalized node.
 * @prop {(key: string) => boolean} isExpanded - Whether the node at a path is expanded.
 * @prop {(key: string) => () => void} onToggle - Returns the toggle handler for a path.
 */
const AttributeCell: React.FC<{
  attribute: ClassifiedAttribute;
  replacements: Reference.Replacement[];
  index: Reference.ReferenceIndex;
  isExpanded: (key: string) => boolean;
  onToggle: (key: string) => () => void;
}> = ({ attribute, replacements, index, isExpanded, onToggle }) => {
  const wholeAttribute = replacements.find((replacement) => replacement.isWholeAttribute);

  if (wholeAttribute) {
    return (
      <ReferenceNode
        referenceId={wholeAttribute.referenceId}
        index={index}
        isExpanded={isExpanded}
        onToggle={onToggle}
        path={attribute.key}
      />
    );
  }

  if (replacements.length === 0) {
    return <AttributeValue attribute={attribute} />;
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <AttributeValue attribute={attribute} />
      </StackItem>
      <StackItem>
        <ReplacementList
          replacements={replacements}
          index={index}
          isExpanded={isExpanded}
          onToggle={onToggle}
          depth={0}
          ancestors={[]}
          parentPath={attribute.key}
        />
      </StackItem>
    </Stack>
  );
};
