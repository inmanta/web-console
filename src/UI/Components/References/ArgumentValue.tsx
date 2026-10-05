import React from "react";
import { Label, Stack, StackItem } from "@patternfly/react-core";
import styled from "styled-components";
import { Reference, ResourceDetailsTab } from "@/Core/Domain";
import { ClassifiedAttribute } from "@/Data/Common/AttributeClassifier/ClassifiedAttribute";
import { classifyValue } from "@/Data/Common/References/classifyValue";
import { AttributeValue, WithSuffix } from "@/UI/Components/AttributeList";
import { ResourceLink } from "@/UI/Components/ResourceLink";
import { HoverRow } from "@/UI/Components/RowHoverReveal";
import { words } from "@/UI/words";
import { ReferenceNode } from "./ReferenceNode";
import { ReplacementList } from "./ReplacementList";

// Values the classifier renders as a single line; anything else renders as a block
// (code editor or file block), which gets no kind label.
const INLINE_KINDS: ClassifiedAttribute["kind"][] = ["SingleLine", "Password", "Undefined"];

interface Props {
  argument: Reference.Argument;
  referenceType: string;
  index: Reference.ReferenceIndex;
  isExpanded: (key: string) => boolean;
  onToggle: (key: string) => () => void;
  depth: number;
  ancestors: string[];
  path: string;
}

/**
 * Renders one normalized argument by its kind: literal/json through the shared
 * attribute pipeline, a reference as an expandable child node, mjson with its
 * replacements under it, a resource as a link, python_type/get as text, and unknown
 * from its raw payload. A fact reference's `resource_id` links to that resource's
 * Facts tab. Inline values carry a kind label behind them, a reference carries it
 * in its toggle, and a code editor gets none. Child nodes extend `path` with the
 * argument name so their expansion is per occurrence.
 *
 * @prop {Reference.Argument} argument - The normalized argument to render.
 * @prop {string} referenceType - The type of the reference that owns the argument.
 * @prop {Reference.ReferenceIndex} index - Lookup from reference id to normalized node.
 * @prop {(key: string) => boolean} isExpanded - Whether the node at a path is expanded.
 * @prop {(key: string) => () => void} onToggle - Returns the toggle handler for a path.
 * @prop {number} depth - Current nesting depth, checked against the depth cap.
 * @prop {string[]} ancestors - Reference ids on the path here, for cycle detection.
 * @prop {string} path - The owning node's path, extended for child nodes.
 */
export const ArgumentValue: React.FC<Props> = ({
  argument,
  referenceType,
  index,
  isExpanded,
  onToggle,
  depth,
  ancestors,
  path,
}) => {
  const label = kindLabel(argument);

  switch (argument.kind) {
    case "literal":
    case "json": {
      const factResource = factResourceId(referenceType, argument);

      if (factResource !== undefined) {
        return (
          <WithKindLabel label={words("references.argumentKind.resource")}>
            <ResourceLink resourceId={factResource} tab={ResourceDetailsTab.Facts} />
          </WithKindLabel>
        );
      }

      return (
        <ClassifiedValue attribute={classifyValue(argument.name, argument.value)} label={label} />
      );
    }

    case "mjson":
      return (
        <Stack hasGutter>
          <StackItem>
            <HoverRow>
              <ClassifiedValue
                attribute={classifyValue(argument.name, argument.value)}
                label={label}
              />
            </HoverRow>
          </StackItem>
          <StackItem>
            <ReplacementList
              replacements={argument.replacements}
              index={index}
              isExpanded={isExpanded}
              onToggle={onToggle}
              depth={depth + 1}
              ancestors={ancestors}
              parentPath={`${path}/${argument.name}`}
            />
          </StackItem>
        </Stack>
      );

    case "reference":
      return (
        <ReferenceNode
          referenceId={argument.referenceId}
          index={index}
          isExpanded={isExpanded}
          onToggle={onToggle}
          depth={depth + 1}
          ancestors={ancestors}
          path={`${path}/${argument.name}`}
          toggleLabel={<Label isCompact>{label}</Label>}
        />
      );

    case "resource":
      return (
        <WithKindLabel label={label}>
          <ResourceLink resourceId={argument.resourceId} />
        </WithKindLabel>
      );

    case "python_type":
      return (
        <WithKindLabel label={label}>
          <code>{argument.value}</code>
        </WithKindLabel>
      );

    case "get":
      return (
        <WithKindLabel label={label}>
          <code>
            {argument.expression} <Unresolved>({words("references.unresolved.marker")})</Unresolved>
          </code>
        </WithKindLabel>
      );

    case "unknown": {
      // The label is the only place an unknown kind's type name shows, so it is
      // kept even above a code editor.
      const attribute = classifyValue(argument.name, argument.raw);

      if (INLINE_KINDS.includes(attribute.kind)) {
        return <ClassifiedValue attribute={attribute} label={label} />;
      }

      return (
        <Stack hasGutter>
          <StackItem>
            <Label isCompact>{label}</Label>
          </StackItem>
          <StackItem>
            <AttributeValue attribute={attribute} />
          </StackItem>
        </Stack>
      );
    }
  }
};

/**
 * The text of an argument's kind label; an unknown kind shows its payload type.
 *
 * @example kindLabel({ kind: "literal", name: "name", value: "TOKEN" }) -> "literal"
 */
const kindLabel = (argument: Reference.Argument): string =>
  argument.kind === "unknown" ? argument.type : words(`references.argumentKind.${argument.kind}`);

/**
 * The resource a `std::FactReference` reads its fact from, or `undefined` for any
 * other argument. The type stores it as a plain string `resource_id`, so it arrives
 * as a literal rather than a resource argument.
 *
 * @example factResourceId("std::FactReference", { kind: "literal", name: "resource_id", value: "std::File[a,path=/tmp]" }) -> "std::File[a,path=/tmp]"
 */
const factResourceId = (referenceType: string, arg: Reference.Argument): string | undefined =>
  referenceType === Reference.FACT_REFERENCE_TYPE &&
  arg.kind === "literal" &&
  arg.name === "resource_id" &&
  typeof arg.value === "string"
    ? arg.value
    : undefined;

/**
 * An inline value with its kind label right behind it, both vertically centered.
 *
 * @prop {string} label - The kind label text.
 * @prop {React.ReactNode} children - The value the label follows.
 */
const WithKindLabel: React.FC<React.PropsWithChildren<{ label: string }>> = ({
  label,
  children,
}) => <WithSuffix suffix={<Label isCompact>{label}</Label>}>{children}</WithSuffix>;

/**
 * A classified value, labelled when it renders inline and bare when it renders as
 * a code editor. The label goes before the copy button of a copyable value, so it
 * sits right next to the value.
 *
 * @prop {ClassifiedAttribute} attribute - The classified value to render.
 * @prop {string} label - The kind label text for an inline value.
 */
const ClassifiedValue: React.FC<{ attribute: ClassifiedAttribute; label: string }> = ({
  attribute,
  label,
}) => (
  <AttributeValue
    attribute={attribute}
    suffix={INLINE_KINDS.includes(attribute.kind) ? <Label isCompact>{label}</Label> : undefined}
  />
);

const Unresolved = styled.span`
  color: var(--pf-t--global--text--color--subtle);
`;
