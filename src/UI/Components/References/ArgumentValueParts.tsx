import React from "react";
import { Label } from "@patternfly/react-core";
import styled from "styled-components";
import { Reference } from "@/Core/Domain";
import { ClassifiedAttribute } from "@/Data/Common/AttributeClassifier/ClassifiedAttribute";
import { AttributeValue, WithSuffix } from "@/UI/Components/AttributeList";
import { words } from "@/UI/words";

// Values the classifier renders as a single line; anything else renders as a block
// (code editor or file block), which gets no kind label.
export const INLINE_KINDS: ClassifiedAttribute["kind"][] = ["SingleLine", "Password", "Undefined"];

/**
 * The text of an argument's kind label; an unknown kind shows its payload type.
 *
 * @example kindLabel({ kind: "literal", name: "name", value: "TOKEN" }) -> "literal"
 */
export const kindLabel = (argument: Reference.Argument): string =>
  argument.kind === "unknown" ? argument.type : words(`references.argumentKind.${argument.kind}`);

/**
 * The resource a `std::FactReference` reads its fact from, or `undefined` for any
 * other argument. The type stores it as a plain string `resource_id`, so it arrives
 * as a literal rather than a resource argument.
 *
 * @example factResourceId("std::FactReference", { kind: "literal", name: "resource_id", value: "std::File[a,path=/tmp]" }) -> "std::File[a,path=/tmp]"
 */
export const factResourceId = (
  referenceType: string,
  arg: Reference.Argument
): string | undefined =>
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
export const WithKindLabel: React.FC<React.PropsWithChildren<{ label: string }>> = ({
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
export const ClassifiedValue: React.FC<{ attribute: ClassifiedAttribute; label: string }> = ({
  attribute,
  label,
}) => (
  <AttributeValue
    attribute={attribute}
    suffix={INLINE_KINDS.includes(attribute.kind) ? <Label isCompact>{label}</Label> : undefined}
  />
);

export const Unresolved = styled.span`
  color: var(--pf-t--global--text--color--subtle);
`;
