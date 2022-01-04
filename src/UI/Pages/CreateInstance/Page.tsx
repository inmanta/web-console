import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { PageContainer, ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { CreateInstance } from "./CreateInstance";

const PageWrapper: React.FC = ({ children, ...props }) => (
  <PageContainer title={words("inventory.createInstance.title")} {...props}>
    {children}
  </PageContainer>
);

export const Page: React.FC = () => {
  const { service: serviceName } = useRouteParams<"CreateInstance">();
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
