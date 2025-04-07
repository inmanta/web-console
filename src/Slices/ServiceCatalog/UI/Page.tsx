import React from "react";
import { useGetServiceModels } from "@/Data/Managers/V2/Service";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageContainer,
} from "@/UI/Components";
import { CatalogActions } from "@/UI/Components/CatalogActions";
import { words } from "@/UI/words";
import { CatalogDataList } from "./CatalogDataList";

export const Page: React.FC = () => {
  const { data, isError, error, isSuccess, refetch } =
    useGetServiceModels().useContinuous();

  let component: React.JSX.Element = (
    <LoadingView ariaLabel="ServiceCatalog-Loading" />
  );

  if (isError) {
    component = (
      <ErrorView
        message={error.message}
        retry={refetch}
        ariaLabel="ServiceCatalog-Failed"
      />
    );
  }
  if (isSuccess) {
    component =
      data.length <= 0 ? (
        <>
          <EmptyView
            aria-label="ServiceCatalog-Empty"
            message={words("catalog.empty.message")}
          />
        </>
      ) : (
        <div aria-label="ServiceCatalog-Success">
          <CatalogDataList services={data} />
        </div>
      );
  }

  return (
    <PageContainer
      pageTitle={
        <>
          {words("catalog.title")}
          <CatalogActions />
        </>
      }
    >
      {component}
    </PageContainer>
  );
};
