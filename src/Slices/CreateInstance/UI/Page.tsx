import React from "react";
import { useGetServiceModel } from "@/Data/Queries/Slices/Service";
import { ErrorView } from "@/UI/Components/ErrorView";
import { LoadingView } from "@/UI/Components/LoadingView";
import { PageContainer } from "@/UI/Components/PageContainer";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
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
