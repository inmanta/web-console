import { CompileDetails } from "@/Core";
import { words } from "@/UI/words";
import {
  CodeBlock,
  CodeBlockCode,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@patternfly/react-icons";
import React from "react";
import styled from "styled-components";

interface Props {
  compileDetails: CompileDetails;
}
export const StatusSection: React.FC<Props> = ({ compileDetails }) => {
  return (
    <>
      TimeLine
      <DescriptionList isHorizontal columnModifier={{ default: "2Col" }}>
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
              <GreenCheckCircle />
            ) : compileDetails.success === false ? (
              <RedExclamationCircle />
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
      </DescriptionList>
      <EnvVarList>
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
      </EnvVarList>
    </>
  );
};

const EnvVarList = styled(DescriptionList)`
  padding-top: 1em;
`;

const GreenCheckCircle = styled(CheckCircleIcon)`
  color: var(--pf-global--success-color--100);
`;

const RedExclamationCircle = styled(ExclamationCircleIcon)`
  color: var(--pf-global--danger-color--100);
`;
