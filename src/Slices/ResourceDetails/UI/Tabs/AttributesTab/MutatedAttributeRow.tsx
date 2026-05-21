import React from "react";
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import styled from "styled-components";
import {
  QUOTED_SENTINEL_PATTERN,
  RAW_SENTINEL_PATTERN,
  ReferenceChip,
  splitWithChips,
} from "../ReferencesTab/sentinel";

interface Props {
  attributeKey: string;
  value: unknown;
  onNavigateToReference: (id: string) => void;
  getReferenceType: (id: string) => string | undefined;
}

const CodeBlock = styled.pre`
  margin: 0;
  padding: 12px;
  border-radius: 4px;
  background: var(--pf-t--global--background--color--secondary--default, #f5f5f5);
  font-family: var(--pf-t--global--font--family--mono, monospace);
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

const isPureSentinel = (text: string): boolean => {
  RAW_SENTINEL_PATTERN.lastIndex = 0;
  const match = RAW_SENTINEL_PATTERN.exec(text);

  return match !== null && match.index === 0 && match[0].length === text.length;
};

const extractSentinelId = (text: string): string | null => {
  RAW_SENTINEL_PATTERN.lastIndex = 0;
  const match = RAW_SENTINEL_PATTERN.exec(text);

  return match ? match[1] : null;
};

/**
 * One DescriptionList row for an attribute whose value has been touched by a
 * mutator. Three render branches:
 *
 *  - Value is exactly a sentinel string → single chip.
 *  - Value is a string with mixed text + sentinel(s) → inline chips.
 *  - Value is an object/array → JSON code block with sentinels split into
 *    chips (same trick used by `MjsonValueView`).
 */
export const MutatedAttributeRow: React.FC<Props> = ({
  attributeKey,
  value,
  onNavigateToReference,
  getReferenceType,
}) => {
  const body = ((): React.ReactNode => {
    if (typeof value === "string") {
      if (isPureSentinel(value)) {
        const refId = extractSentinelId(value);

        return refId === null ? (
          value
        ) : (
          <ReferenceChip
            refId={refId}
            onNavigateToReference={onNavigateToReference}
            getReferenceType={getReferenceType}
            keyHint={attributeKey}
          />
        );
      }

      return splitWithChips({
        text: value,
        pattern: RAW_SENTINEL_PATTERN,
        onNavigateToReference,
        getReferenceType,
      });
    }

    const json = JSON.stringify(value, null, 2);

    return (
      <CodeBlock>
        {splitWithChips({
          text: json,
          pattern: QUOTED_SENTINEL_PATTERN,
          onNavigateToReference,
          getReferenceType,
        })}
      </CodeBlock>
    );
  })();

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{attributeKey}</DescriptionListTerm>
      <DescriptionListDescription data-testid={`attribute-${attributeKey}`}>
        {body}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};
