import React, { useContext } from "react";
import {
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  TabContent,
} from "@patternfly/react-core";
import { DeploymentProgress } from "@/Core";
import { useGetInstanceResources } from "@/Data/Managers/V2/GETTERS/GetInstanceResources/useGetInstanceResources";
import { DeploymentProgressBar } from "@/Slices/ServiceInventory/UI/Components";
import { DependencyContext, words } from "@/UI";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  ResourceTable,
} from "@/UI/Components";
import { InstanceDetailsContext } from "../../Core/Context";

export const ResourcesTabContent: React.FC = () => {
  const { instance } = useContext(InstanceDetailsContext);
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const { data, isSuccess, isError, error } = useGetInstanceResources(
    instance.id,
    instance.service_entity,
    String(instance.version),
    environment,
  ).useContinuous();

  if (isSuccess) {
    return (
      <TabContent role="tabpanel" id={"Resources-content"}>
        {data.length === 0 ? (
          <EmptyView
            title={words("inventory.resourcesTab.empty.title")}
            message={words("inventory.resourcesTab.empty.body")}
          />
        ) : (
          <>
            <DeploymentProgress
              deployment_progress={instance.deployment_progress}
            />
            <ResourceTable resources={data} aria-label="Resource-table" />
          </>
        )}
      </TabContent>
    );
  }

  if (isError) {
    return (
      <TabContent role="tabpanel" id={"Resources-content"}>
        <ErrorView
          message={error.message}
          ariaLabel="Error_view-Resources-content"
        />
      </TabContent>
    );
  }

  return (
    <TabContent role="tabpanel" id={"Resources-content"}>
      <LoadingView ariaLabel="Resources-Loading" />
    </TabContent>
  );
};

interface Props {
  deployment_progress?: DeploymentProgress | null;
}

const DeploymentProgress: React.FC<Props> = ({ deployment_progress }) => {
  if (!deployment_progress) {
    return (
      <Flex>{words("instanceDetails.tabs.resources.EmptyResources")}</Flex>
    );
  }

  return (
    <DescriptionList
      isHorizontal
      horizontalTermWidthModifier={{
        default: "15ch",
      }}
      style={{
        marginTop: "var(--pf-t--global--spacer--300)",
        marginLeft: "var(--pf-t--global--spacer--400)",
      }}
    >
      <DescriptionListGroup>
        <DescriptionListTerm>
          {words("instanceDetails.tabs.resources.deploymentProgress")}
        </DescriptionListTerm>
        <DescriptionListDescription>
          <Flex>
            <FlexItem flex={{ default: "flex_1" }}>
              <DeploymentProgressBar progress={deployment_progress} />
            </FlexItem>
            <FlexItem flex={{ default: "flex_1" }}>
              <Content>
                {Number(deployment_progress.deployed)} /{" "}
                {Number(deployment_progress.total)}
              </Content>
            </FlexItem>
          </Flex>
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};
