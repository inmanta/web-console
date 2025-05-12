import React from "react";
import {
  CodeBlock,
  CodeBlockCode,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { CompileError } from "@/Core";
import { words } from "@/UI/words";

interface Props {
  errors: CompileError[];
}

/**
 * Renders a section displaying compile errors with type and message details.
 *
 * @prop {CompileError[]} errors - The array of compile errors
 * @returns {React.ReactNode} The rendered component
 */
export const CompileErrorsSection: React.FC<Props> = ({ errors }) => (
  <DescriptionList isAutoFit>
    {errors.map((compileError, idx) => [
      <DescriptionListGroup key={`type-${idx}`}>
        <DescriptionListTerm>{words("compileDetails.errors.type")}</DescriptionListTerm>
        <DescriptionListDescription>{compileError.type}</DescriptionListDescription>
      </DescriptionListGroup>,
      <DescriptionListGroup key={`message-${idx}`}>
        <DescriptionListTerm>{words("compileDetails.errors.message")}</DescriptionListTerm>
        <DescriptionListDescription>
          <CodeBlock>
            <CodeBlockCode>{JSON.stringify(compileError.message, null, 2)}</CodeBlockCode>
          </CodeBlock>
        </DescriptionListDescription>
      </DescriptionListGroup>,
    ])}
  </DescriptionList>
);
