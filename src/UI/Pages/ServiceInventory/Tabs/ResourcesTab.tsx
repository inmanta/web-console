import React, { useContext } from "react";
import { Query, RemoteData } from "@/Core";
import {
  ResourceTable,
  ResourceTableWrapper,
  EmptyView,
  LoadingView,
  ErrorView,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  qualifier: Query.Qualifier<"Resources">;
}

export const ResourcesTab: React.FC<Props> = ({ qualifier }) => {
  const { dataProvider } = useContext(DependencyContext);

  const [data] = dataProvider.useContinuous<"Resources">({
    kind: "Resources",
    qualifier,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <ResourceTableWrapper
          aria-label="ResourceTable-Loading"
          id={qualifier.id}
        >
          <LoadingView delay={500} />
        </ResourceTableWrapper>
      ),
      failed: (error) => (
        <ResourceTableWrapper
          aria-label="ResourceTable-Failed"
          id={qualifier.id}
        >
          <ErrorView
            title={words("inventory.resourcesTab.failed.title")}
            message={words("inventory.resourcesTab.failed.body")(error)}
          />
        </ResourceTableWrapper>
      ),
      success: (resources) =>
        resources.length === 0 ? (
          <ResourceTableWrapper
            aria-label="ResourceTable-Empty"
            id={qualifier.id}
          >
            <EmptyView
              title={words("inventory.resourcesTab.empty.title")}
              message={words("inventory.resourcesTab.empty.body")}
            />
          </ResourceTableWrapper>
        ) : (
          <ResourceTable
            resources={resources}
            aria-label="ResourceTable-Success"
            id={qualifier.id}
          />
        ),
    },
    data
  );
};
