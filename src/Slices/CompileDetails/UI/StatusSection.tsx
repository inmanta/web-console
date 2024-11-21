import React from "react";
import {
  CodeBlock,
  CodeBlockCode,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Icon,
} from "@patternfly/react-core";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@patternfly/react-icons";
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
    <>
      <Flex justifyContent={{ default: "justifyContentCenter" }}>
        <FlexItem>
          <Timeline
            requested={compileDetails.requested}
            started={compileDetails.started}
            completed={compileDetails.completed}
            success={compileDetails.success}
          />
        </FlexItem>
      </Flex>
      <DescriptionList isHorizontal columnModifier={{ default: "2Col" }}>
        <>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {words("compileDetails.status.export")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {compileDetails.do_export.toString()}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {words("compileDetails.status.update")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {compileDetails.force_update.toString()}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {words("compileDetails.status.success")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {compileDetails.success ? (
                <Icon status="success">
                  <CheckCircleIcon />
                </Icon>
              ) : compileDetails.success === false ? (
                <Icon status="danger">
                  <ExclamationCircleIcon />
                </Icon>
              ) : (
                ""
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>
              {words("compileDetails.status.message")}
            </DescriptionListTerm>
            <DescriptionListDescription>
              {compileDetails.metadata["message"] as string}
            </DescriptionListDescription>
          </DescriptionListGroup>
          {compileDetails.metadata["type"] && (
            <DescriptionListGroup>
              <DescriptionListTerm>
                {words("compileDetails.status.trigger")}
              </DescriptionListTerm>
              <DescriptionListDescription>
                {compileDetails.metadata["type"] as string}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </>
      </DescriptionList>
      <DescriptionList>
        <DescriptionListGroup>
          <DescriptionListTerm>
            {words("compileDetails.status.envVars")}
          </DescriptionListTerm>
          <DescriptionListDescription>
            <CodeBlock>
              <CodeBlockCode>
                {JSON.stringify(compileDetails.environment_variables, null, 2)}
              </CodeBlockCode>
            </CodeBlock>
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </>
  );
};
