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
import { FactsTable } from "./FactsTable";
import { FactsTablePresenter } from "./FactsTablePresenter";
import { TableControls } from "./TableControls";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);

  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Facts",
  });
  const [filter, setFilter] = useUrlStateWithFilter<GetFacts.Filter>({
    route: "Facts",
  });
  const [sort, setSort] = useUrlStateWithSort<GetFacts.SortKey>({
    default: { name: "name", order: "asc" },
    route: "Facts",
  });

  const [data] = queryResolver.useContinuous<"GetFacts">({
    kind: "GetFacts",
    sort,
    filter,
    pageSize,
  });

  const tablePresenter = new FactsTablePresenter();

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
        label="Facts"
        SuccessView={(data) => (
          <FactsTable
            aria-label="Facts-Success"
            rows={tablePresenter.createRows(data.data)}
            tablePresenter={tablePresenter}
            sort={sort}
            setSort={setSort}
          />
        )}
      />
    </PageContainer>
  );
};
