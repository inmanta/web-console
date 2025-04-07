import React from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { Diagnostics } from "@S/Diagnose/Core/Domain";
import { FailureCard } from "./FailureCard";
import { RejectionCard } from "./RejectionCard";

export const DiagnoseCardLayout: React.FC<{
  diagnostics: Diagnostics;
}> = ({ diagnostics }) => {
  return (
    <Flex direction={{ default: "column" }}>
      {diagnostics.failures.map(
        (failureGroup, idx) =>
          failureGroup.failures.length > 0 && (
            <FlexItem key={`failure-${idx}`}>
              <FailureCard
                resourceId={failureGroup.resource_id}
                failure={failureGroup.failures[0]}
              />
            </FlexItem>
          ),
      )}
      {diagnostics.rejections.map((rejection, idx) => (
        <FlexItem key={`rejection-${idx}`}>
          <RejectionCard rejection={rejection} />
        </FlexItem>
      ))}
    </Flex>
  );
};
