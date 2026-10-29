import React from "react";
import { words } from "@inmanta/web-console-core";
import { useGetServiceModel } from "@inmanta/web-console-core/Queries/Slices/Service";
import { useRouteParams } from "@inmanta/web-console-core/Routing";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { CreateInstance } from "./CreateInstance";

export const Page: React.FC = () => {
  const { service: serviceName } = useRouteParams<"CreateInstance">();

  const { data, isError, error, isSuccess, refetch } =
    useGetServiceModel(serviceName).useContinuous();

  if (isError) {
    <PageContainer pageTitle={words("inventory.createInstance.title")}>
      <ErrorView message={error.message} retry={refetch} ariaLabel="ServicesProvider-Failed" />
    </PageContainer>;
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={words("inventory.createInstance.title")}>
        <div aria-label="AddInstance-Success">
          <CreateInstance serviceEntity={data} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("inventory.createInstance.title")}>
      <LoadingView ariaLabel="ServicesProvider-Loading" />
    </PageContainer>
  );
};
