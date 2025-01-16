import React, { useContext } from "react";
import { Content, TabContent, TabContentBody } from "@patternfly/react-core";
import { useGetInstanceResources } from "@/Data/Managers/V2/GETTERS/GetInstanceResources";
import { DependencyContext, words } from "@/UI";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  ResourceTable,
} from "@/UI/Components";
import { InstanceDetailsContext } from "../../Core/Context";
import { TabContentWrapper } from "./TabContentWrapper";

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
      <TabContentWrapper role="tabpanel" id={"Resources-content"}>
        {data.length === 0 ? (
          <EmptyView
            title={words("inventory.resourcesTab.empty.title")}
            message={words("inventory.resourcesTab.empty.body")}
          />
        ) : (
          <TabContentBody>
            {!instance.deployment_progress && (
              <Content>
                {words("instanceDetails.tabs.resources.EmptyResources")}
              </Content>
            )}
            <ResourceTable resources={data} aria-label="Resource-table" />
          </TabContentBody>
        )}
      </TabContentWrapper>
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
