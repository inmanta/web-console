import React, { useContext } from "react";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import {
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Filter, SortKey } from "@S/Facts/Core/Query";
import { FactsTable } from "./FactsTable";
import { FactsTablePresenter } from "./FactsTablePresenter";
import { TableControls } from "./TableControls";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);

  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "Facts",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Facts",
  });
  const [filter, setFilter] = useUrlStateWithFilter<Filter>({
    route: "Facts",
  });
  const [sort, setSort] = useUrlStateWithSort<SortKey>({
    default: { name: "name", order: "asc" },
    route: "Facts",
  });

  const [data] = queryResolver.useContinuous<"GetFacts">({
    kind: "GetFacts",
    sort,
    filter,
    pageSize,
    currentPage,
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
            setCurrentPage={setCurrentPage}
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
