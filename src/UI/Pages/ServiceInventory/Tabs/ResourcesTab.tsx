import React, { useContext } from "react";
import { RemoteData, VersionedServiceInstanceIdentifier } from "@/Core";
import {
  ResourceTable,
  ResourceTableWrapper,
  EmptyView,
  LoadingView,
  ErrorView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  serviceInstanceIdentifier: VersionedServiceInstanceIdentifier;
}

export const ResourcesTab: React.FC<Props> = ({
  serviceInstanceIdentifier,
}) => {
  const { queryResolver } = useContext(DependencyContext);
  const { id } = serviceInstanceIdentifier;

  const [data] = queryResolver.useContinuous<"GetInstanceResources">({
    kind: "GetInstanceResources",
    ...serviceInstanceIdentifier,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <ResourceTableWrapper aria-label="ResourceTable-Loading" id={id}>
          <LoadingView />
        </ResourceTableWrapper>
      ),
      failed: (error) => (
        <ResourceTableWrapper aria-label="ResourceTable-Failed" id={id}>
          <ErrorView
            title={words("inventory.resourcesTab.failed.title")}
            message={words("inventory.resourcesTab.failed.body")(error)}
          />
        </ResourceTableWrapper>
      ),
      success: (resources) =>
        resources.length === 0 ? (
          <ResourceTableWrapper aria-label="ResourceTable-Empty" id={id}>
            <EmptyView
              title={words("inventory.resourcesTab.empty.title")}
              message={words("inventory.resourcesTab.empty.body")}
            />
          </ResourceTableWrapper>
        ) : (
          <ResourceTable
            resources={resources}
            aria-label="ResourceTable-Success"
            id={id}
          />
        ),
    },
    data
  );
};
