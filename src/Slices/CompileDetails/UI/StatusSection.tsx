import React from "react";
import {
  Bullseye,
  CodeBlock,
  CodeBlockCode,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { Timeline } from "@/UI/Components/Timeline";
import { words } from "@/UI/words";
import { CompileDetails } from "@S/CompileDetails/Core/Domain";

interface Props {
  compileDetails: Pick<
    CompileDetails,
    | "completed"
    | "started"
    | "requested"
    | "do_export"
    | "force_update"
    | "success"
    | "metadata"
    | "environment_variables"
  >;
}

export const StatusSection: React.FC<Props> = ({ compileDetails }) => {
  return (
    <Flex rowGap={{ default: "rowGapXl" }} direction={{ default: "column" }}>
      <FlexItem>
        <Bullseye>
          <Timeline
            requested={compileDetails.requested}
            started={compileDetails.started}
            completed={compileDetails.completed}
            success={compileDetails.success}
          />
        </Bullseye>
      </FlexItem>
      <FlexItem>
        <DescriptionList isHorizontal isFillColumns columnModifier={{ default: "2Col" }}>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("compileDetails.status.export")}</DescriptionListTerm>
            <DescriptionListDescription>
              {compileDetails.do_export.toString()}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("compileDetails.status.update")}</DescriptionListTerm>
            <DescriptionListDescription>
              {compileDetails.force_update.toString()}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("compileDetails.status.message")}</DescriptionListTerm>
            <DescriptionListDescription>
              {compileDetails.metadata["message"] as string}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {compileDetails.metadata["type"] ? (
            <DescriptionListGroup>
              <DescriptionListTerm>{words("compileDetails.status.trigger")}</DescriptionListTerm>
              <DescriptionListDescription>
                {compileDetails.metadata["type"] as string}
              </DescriptionListDescription>
            </DescriptionListGroup>
          ) : (
            ""
          )}
        </DescriptionList>
      </FlexItem>
      <FlexItem>
        <DescriptionList isHorizontal isAutoFit>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("compileDetails.status.envVars")}</DescriptionListTerm>
            <DescriptionListDescription>
              <CodeBlock>
                <CodeBlockCode>
                  {JSON.stringify(compileDetails.environment_variables, null, 2)}
                </CodeBlockCode>
              </CodeBlock>
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </FlexItem>
    </Flex>
  );
};
