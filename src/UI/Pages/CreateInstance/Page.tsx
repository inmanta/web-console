import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { RemoteData, RouteParams } from "@/Core";
import { words } from "@/UI/words";
import { DependencyContext } from "@/UI/Dependency";
import { PageSectionWithTitle, ErrorView, LoadingView } from "@/UI/Components";
import { CreateInstance } from "./CreateInstance";

const PageWrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle
    {...props}
    title={words("inventory.createInstance.title")}
  >
    {children}
  </PageSectionWithTitle>
);

export const Page: React.FC = () => {
  const { service: serviceName } = useParams<RouteParams<"CreateInstance">>();
  const { queryResolver } = useContext(DependencyContext);

  const [data, retry] = queryResolver.useContinuous<"GetService">({
    kind: "GetService",
    name: serviceName,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <PageWrapper aria-label="AddInstance-Loading">
          <LoadingView />
        </PageWrapper>
      ),
      failed: (error) => (
        <PageWrapper aria-label="AddInstance-Failed">
          <ErrorView message={error} retry={retry} />
        </PageWrapper>
      ),
      success: (service) => (
        <PageWrapper aria-label="AddInstance-Success">
          <CreateInstance serviceEntity={service} />
        </PageWrapper>
      ),
    },
    data
  );
};
