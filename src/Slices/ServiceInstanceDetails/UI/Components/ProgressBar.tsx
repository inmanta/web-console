import React from "react";
import {
  Content,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { DeploymentProgress } from "@/Core";
import { DeploymentProgressBar } from "@/Slices/ServiceInventory/UI/Components";
import { words } from "@/UI";

interface Props {
  deployment_progress?: DeploymentProgress | null;
}

/**
 * ProgressBar component
 *
 * It displays a deployment progress bar
 *
 * @param {ProgressBarProps} props - The properties passed to the ProgressBar component.
 * @returns {JSX.Element} The rendered ProgressBar component.
 */
export const ProgressBar: React.FC<Props> = ({ deployment_progress }) => {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>
        {words("instanceDetails.tabs.resources.deploymentProgress")}
      </DescriptionListTerm>
      <DescriptionListDescription>
        <Flex>
          <FlexItem flex={{ default: "flex_1" }}>
            <DeploymentProgressBar progress={deployment_progress} />
          </FlexItem>
          {deployment_progress && (
            <FlexItem>
              <Content>
                {Number(deployment_progress.deployed)} /{" "}
                {Number(deployment_progress.total)}
              </Content>
            </FlexItem>
          )}
        </Flex>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};
