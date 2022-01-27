import React, { useContext } from "react";
import { GetFacts } from "@/Core";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import {
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { TableControls } from "./TableControls";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);

  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Facts",
  });
  const [filter, setFilter] = useUrlStateWithFilter<GetFacts.Filter>({
    route: "Facts",
  });
  const [sort] = useUrlStateWithSort<GetFacts.SortKey>({
    default: { name: "name", order: "asc" },
    route: "Facts",
  });

  const [data] = queryResolver.useContinuous<"GetFacts">({
    kind: "GetFacts",
    sort,
    filter,
    pageSize,
  });

  return (
    <PageContainer title={words("facts.title")}>
      <TableControls
        filter={filter}
        setFilter={setFilter}
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
        SuccessView={(data) => (
          <pre>
            <code>{JSON.stringify(data, null, 4)}</code>
          </pre>
        )}
      />
    </PageContainer>
  );
};
