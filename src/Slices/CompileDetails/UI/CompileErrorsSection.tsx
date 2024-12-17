import React from "react";
import {
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

export const CompileErrorsSection: React.FC<Props> = ({ errors }) => (
  <DescriptionList
    isHorizontal
    isFillColumns
    columnModifier={{ default: "2Col" }}
  >
    {errors.map((compileError, idx) => [
      <DescriptionListGroup key={`type-${idx}`}>
        <DescriptionListTerm>
          {words("compileDetails.errors.type")}
        </DescriptionListTerm>
        <DescriptionListDescription>
          {compileError.type}
        </DescriptionListDescription>
      </DescriptionListGroup>,
      <DescriptionListGroup key={`message-${idx}`}>
        <DescriptionListTerm>
          {words("compileDetails.errors.message")}
        </DescriptionListTerm>
        <DescriptionListDescription>
          {compileError.message}
        </DescriptionListDescription>
      </DescriptionListGroup>,
    ])}
  </DescriptionList>
);
