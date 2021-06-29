import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageSectionWithTitle,
} from "@/UI/Components";
import { words } from "@/UI/words";
import React, { useContext } from "react";
import { ResourcesTableProvider } from "./ResourcesTableProvider";

export const Wrapper: React.FC = ({ children }) => (
  <PageSectionWithTitle title={words("inventory.tabs.resources")}>
    {children}
  </PageSectionWithTitle>
);

export const ResourcesView: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useContinuous<"LatestReleasedResources">({
    kind: "LatestReleasedResources",
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <Wrapper>
          <LoadingView delay={500} aria-label="ResourcesView-Loading" />
        </Wrapper>
      ),
      failed: (error) => (
        <Wrapper>
          <ErrorView
            message={error}
            retry={retry}
            aria-label="ResourcesView-Failed"
          />
        </Wrapper>
      ),
      success: (resources) =>
        resources.length <= 0 ? (
          <Wrapper>
            <EmptyView
              message={words("resources.empty.message")}
              aria-label="ResourcesView-Empty"
            />
          </Wrapper>
        ) : (
          <Wrapper>
            <ResourcesTableProvider
              resources={resources}
              aria-label="ResourcesView-Success"
            />
          </Wrapper>
        ),
    },
    data
  );
};
