import React, { useMemo, useState } from "react";
import { Language } from "@patternfly/react-code-editor";
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
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
import { Reference } from "@/Core/Domain";
import { Details } from "@/Core/Domain/Resource/Resource";
import {
  AttributeClassifier,
  ClassifiedAttribute,
  collectReplacements,
  extractMutators,
  extractReferences,
  indexReferences,
  useUrlStateWithExpansion,
} from "@/Data";
import { AttributeValue, CodeEditor, ReferenceNode, ReplacementList } from "@/UI/Components";
import { words } from "@/UI/words";
import { MACHINERY_KEYS, groupReplacements, partitionFramework } from "./helpers";

interface Props {
  details: Details;
}

type ViewMode = "structured" | "json";

const classifier = new AttributeClassifier();

// Measured so the editor ends on the tab's 16px bottom spacer, like the structured view.
const JSON_EDITOR_HEIGHT = "calc(100vh - 459px)";

/**
 * The Desired State tab. A whole-attribute reference replaces the null with an
 * expandable node; a nested one keeps the value and lists its replacements below.
 * Model and framework attributes get separate cards (framework values wrap side by
 * side), with a top-right Structured / JSON toggle: structured hides the reference
 * machinery, JSON shows `details.attributes` verbatim.
 *
 * @prop {Details} details - The details of the resource
 */
export const AttributesTab: React.FC<Props> = ({ details }) => {
  const [mode, setMode] = useState<ViewMode>("structured");
  const [isExpanded, onToggle] = useUrlStateWithExpansion({
    key: "references",
    route: "ResourceDetails",
  });

  // Derived once per payload, not on every expansion toggle or refetch render.
  const { index, replacementsByKey, model, framework, undisplayedCount, json } = useMemo(() => {
    const { replacements, undisplayedCount } = collectReplacements(
      extractMutators(details.attributes)
    );
    const shownAttributes = Object.fromEntries(
      Object.entries(details.attributes).filter(([key]) => !MACHINERY_KEYS.includes(key))
    );
    const classified = classifier.classify(shownAttributes);
    const shownKeys = new Set(classified.map((attribute) => attribute.key));
    const orphanedCount = replacements.filter(
      (replacement) => !shownKeys.has(replacement.attributeKey)
    ).length;

    return {
      index: indexReferences(extractReferences(details.attributes)),
      replacementsByKey: groupReplacements(replacements),
      ...partitionFramework(classified),
      undisplayedCount: undisplayedCount + orphanedCount,
      json: JSON.stringify(details.attributes, null, 2),
    };
  }, [details.attributes]);

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
  const modelGroup = <DescriptionList>{model.map(renderAttribute)}</DescriptionList>;
  const frameworkGroup = (
    <Flex gap={{ default: "gap4xl" }} flexWrap={{ default: "wrap" }}>
      {framework.map((attribute) => (
        <FlexItem key={attribute.key}>
          <DescriptionList isCompact>{renderAttribute(attribute)}</DescriptionList>
        </FlexItem>
      ))}
    </Flex>
  );

  // flexNone keeps this at content height inside the tab's flex column, so the page
  // section owns the scroll and cards grow to full content instead of clipping; the
  // bottom spacer keeps the last element off the scroll edge.
  return (
    <Flex
      direction={{ default: "column" }}
      gap={{ default: "gapMd" }}
      flex={{ default: "flexNone" }}
      style={{ paddingBottom: "var(--pf-t--global--spacer--md)" }}
    >
      <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
        <ToggleGroup aria-label={words("resources.attributes.view.label")}>
          <ToggleGroupItem
            text={words("resources.attributes.view.structured")}
            buttonId="structured"
            isSelected={mode === "structured"}
            onChange={() => setMode("structured")}
          />
          <ToggleGroupItem
            text={words("resources.attributes.view.json")}
            buttonId="json"
            isSelected={mode === "json"}
            onChange={() => setMode("json")}
          />
        </ToggleGroup>
      </Flex>
      {mode === "json" ? (
        <CodeEditor code={json} language={Language.json} height={JSON_EDITOR_HEIGHT} />
      ) : (
        <>
          <Card isCompact>
            <CardTitle>{words("resources.attributes.modelGroup")}</CardTitle>
            <CardBody>{modelGroup}</CardBody>
          </Card>
          {framework.length > 0 && (
            <Card isCompact>
              <CardTitle>{words("resources.attributes.frameworkGroup")}</CardTitle>
              <CardBody>{frameworkGroup}</CardBody>
            </Card>
          )}
          {undisplayedCount > 0 && (
            <HelperText>
              <HelperTextItem variant="indeterminate">
                {words("references.mutatorsNotDisplayed")(undisplayedCount)}
              </HelperTextItem>
            </HelperText>
          )}
        </>
      )}
    </Flex>
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
