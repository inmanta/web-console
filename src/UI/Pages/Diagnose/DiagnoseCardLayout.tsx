import { Diagnostics } from "@/Core";
import { Flex, FlexItem } from "@patternfly/react-core";
import React from "react";
import { FailureCard } from "./FailureCard";
import { RejectionCard } from "./RejectionCard";

export const DiagnoseCardLayout: React.FC<{
  diagnostics: Diagnostics;
}> = ({ diagnostics }) => {
  return (
    <Flex direction={{ default: "column" }}>
      {diagnostics.failures.map((failureGroup) =>
        failureGroup.failures.map((failure, idx) => (
          <FlexItem key={`failure-${idx}`}>
            <FailureCard failure={failure} />
          </FlexItem>
        ))
      )}
      {diagnostics.rejections.map((rejection, idx) => (
        <FlexItem key={`rejection-${idx}`}>
          <RejectionCard rejection={rejection} />
        </FlexItem>
      ))}
    </Flex>
  );
};
