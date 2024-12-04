import React, { useContext, useEffect } from "react";
import { EmptyView, PageContainer, RemoteDataView } from "@/UI/Components";
import { CatalogActions } from "@/UI/Components/CatalogActions";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { CatalogDataList } from "./CatalogDataList";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useContinuous<"GetServices">({
    kind: "GetServices",
  });

  useEffect(() => {
    document.addEventListener("service-deleted", () => {
      retry();
    });
  }, [retry]);

  return (
    <PageContainer
      pageTitle={
        <>
          {words("catalog.title")}
          <CatalogActions />
        </>
      }
    >
      <RemoteDataView
        data={data}
        retry={retry}
        label="ServiceCatalog"
        SuccessView={(services) =>
          services.length <= 0 ? (
            <>
              <EmptyView
                aria-label="ServiceCatalog-Empty"
                message={words("catalog.empty.message")}
              />
            </>
          ) : (
            <div aria-label="ServiceCatalog-Success">
              <CatalogDataList services={services} />
            </div>
          )
        }
      />
    </PageContainer>
  );
};
