import React from "react";
import { words } from "@inmanta/web-console-core";
import { useGetServiceModels } from "@inmanta/web-console-core/Queries/Slices/Service";
import { CatalogActions } from "@inmanta/web-console-feature-lsm/Components/CatalogActions";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { CatalogSections } from "./CatalogSections";

export const Page: React.FC = () => {
  const { data, isError, error, isSuccess, refetch } = useGetServiceModels().useContinuous();

  let component: React.JSX.Element = <LoadingView ariaLabel="ServiceCatalog-Loading" />;

  if (isError) {
    component = (
      <ErrorView message={error.message} retry={refetch} ariaLabel="ServiceCatalog-Failed" />
    );
  }

  if (isSuccess) {
    component =
      data.length <= 0 ? (
        <EmptyView aria-label="ServiceCatalog-Empty" message={words("catalog.empty.message")} />
      ) : (
        <div aria-label="ServiceCatalog-Success">
          <CatalogSections serviceModels={data} />
        </div>
      );
  }

  return (
    <PageContainer pageTitle={words("catalog.title")} actions={<CatalogActions />}>
      {component}
    </PageContainer>
  );
};
