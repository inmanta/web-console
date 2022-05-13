import React, { useContext } from "react";
import { Resource } from "@/Core";
import { useUrlStateWithPageSize } from "@/Data";
import { words } from "@/UI";
import {
  EmptyView,
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import {
  ComposableTableExpandable,
  RessourceRow,
} from "./ComposableTableExpandable";
import { ResourcTableControlV2 } from "./ResourceTableControlV2";
export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);

  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "ResourcesV2",
  });

  const [data, retry] = queryResolver.useContinuous<"GetResourcesV2">({
    kind: "GetResourcesV2",
  });

  const createRows = (sourceData: Resource.Resource[]): RessourceRow[] => {
    const data: Resource.Resource[] = sourceData;
    return data.map((resource) => ({
      type: resource.id_details.resource_type,
      value: resource.id_details.resource_id_value,
      agent: resource.id_details.agent,
      deployState: resource.status,
      dependeciesNbr: resource.requires.length,
      id: resource.resource_id,
    }));
  };

  return (
    <PageContainer title={"Resources V2"}>
      <ResourcTableControlV2
        paginationWidget={
          <PaginationWidget
            data={data}
            pageSize={pageSize}
            setPageSize={setPageSize}
          />
        }
      />
      <RemoteDataView
        data={data}
        label="ResourcesView"
        retry={retry}
        SuccessView={(rows) =>
          rows.data.length <= 0 ? (
            <EmptyView
              message={words("resources.empty.message")}
              aria-label="ResourcesView-Empty"
            />
          ) : (
            <ComposableTableExpandable rows={createRows(rows.data)} />
          )
        }
      />
    </PageContainer>
  );
};
