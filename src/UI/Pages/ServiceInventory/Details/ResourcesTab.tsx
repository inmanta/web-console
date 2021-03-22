import React, { useContext } from "react";
import { TabProps } from "./Details";
import { RemoteData, VersionedServiceInstanceIdentifier } from "@/Core";
import {
  ResourceTable,
  HrefCreatorImpl,
  ResourceTableWrapper,
  EmptyView,
  LoadingView,
  ErrorView,
} from "@/UI/Components";
import { ServicesContext } from "@/UI/ServicesContext";
import { words } from "@/UI/words";

interface Props extends TabProps {
  qualifier: VersionedServiceInstanceIdentifier;
}

export const ResourcesTab: React.FC<Props> = ({ qualifier }) => {
  const { dataProvider } = useContext(ServicesContext);

  const [data] = dataProvider.useContinuous<"Resources">({
    kind: "Resources",
    qualifier,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <ResourceTableWrapper aria-label="ResourceTable-Loading">
          <LoadingView delay={500} />
        </ResourceTableWrapper>
      ),
      failed: (error) => (
        <ResourceTableWrapper aria-label="ResourceTable-Failed">
          <ErrorView
            title={words("inventory.resourcesTab.failed.title")}
            message={words("inventory.resourcesTab.failed.body")(error)}
          />
        </ResourceTableWrapper>
      ),
      success: (resources) =>
        resources.length === 0 ? (
          <ResourceTableWrapper aria-label="ResourceTable-Empty">
            <EmptyView
              title={words("inventory.resourcesTab.empty.title")}
              message={words("inventory.resourcesTab.empty.body")}
            />
          </ResourceTableWrapper>
        ) : (
          <ResourceTable
            hrefCreator={new HrefCreatorImpl(qualifier.environment)}
            resources={resources}
            aria-label="ResourceTable-Success"
          />
        ),
    },
    data
  );
};
