import React, { useContext } from "react";
import { EmptyView, PageContainer, RemoteDataView } from "@/UI/Components";
import { CatalogUpdateButton } from "@/UI/Components/CatalogUpdateButton";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { CatalogDataList } from "./CatalogDataList";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useContinuous<"GetServices">({
    kind: "GetServices",
  });

  return (
    <PageContainer title={words("catalog.title")}>
      <RemoteDataView
        data={data}
        retry={retry}
        label="ServiceCatalog"
        SuccessView={(services) =>
          services.length <= 0 ? (
            <>
              <CatalogUpdateButton />
              <EmptyView
                aria-label="ServiceCatalog-Empty"
                message={words("catalog.empty.message")}
              />
            </>
          ) : (
            <div aria-label="ServiceCatalog-Success">
              <CatalogUpdateButton />
              <CatalogDataList services={services} />
            </div>
          )
        }
      />
    </PageContainer>
  );
};
