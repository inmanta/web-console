import React, { useContext } from "react";
import { useGetServiceModel } from "@/Data/Managers/V2/GETTERS/GetServiceModel";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { CreateInstance } from "./CreateInstance";

export const Page: React.FC = () => {
  const { service: serviceName } = useRouteParams<"CreateInstance">();
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();

  const { data, isError, error, isSuccess, refetch } = useGetServiceModel(
    serviceName,
    env,
  ).useContinuous();

  if (isError) {
    <PageContainer pageTitle={words("inventory.createInstance.title")}>
      <ErrorView
        message={error.message}
        retry={refetch}
        ariaLabel="ServicesProvider-Failed"
      />
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
