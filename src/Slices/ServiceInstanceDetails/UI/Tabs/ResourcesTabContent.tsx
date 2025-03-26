import React, { useContext, useEffect, useState } from "react";
import { Content, TabContent, TabContentBody } from "@patternfly/react-core";
import { useGetInstanceResources } from "@/Data/Managers/V2/ServiceInstance";
import { words } from "@/UI";
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
  const { data, isSuccess, isError, error } = useGetInstanceResources(
    instance.id,
    instance.service_entity,
    String(instance.version),
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
    // If the error is because of the version, we don't want to show the error view, and fall back to the loading view as the process of updating version is still ongoing
    if (
      !error.message.includes(
        "Request conflicts with the current state of the resource: The given current version",
      )
    ) {
      return (
        <TabContent role="tabpanel" id={"Resources-content"}>
          <ErrorView
            message={error.message}
            ariaLabel="Error_view-Resources-content"
          />
        </TabContent>
      );
    }
  }

  return (
    <TabContent role="tabpanel" id={"Resources-content"}>
      <LoadingView ariaLabel="Resources-Loading" />
    </TabContent>
  );
};
