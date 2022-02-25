import React, { useContext } from "react";
import { GetParameters } from "@/Core";
import {
  useUrlStateWithFilter,
  useUrlStateWithPageSize,
  useUrlStateWithSort,
} from "@/Data";
import {
  EmptyView,
  PageContainer,
  PaginationWidget,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ParametersTable } from "./ParametersTable";
import { ParametersTablePresenter } from "./ParametersTablePresenter";
import { TableControls } from "./TableControls";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "Parameters",
  });
  const [filter, setFilter] = useUrlStateWithFilter<GetParameters.Filter>({
    route: "Parameters",
    keys: { updated: "DateRange" },
  });
  const [sort, setSort] = useUrlStateWithSort<GetParameters.SortKey>({
    default: { name: "name", order: "asc" },
    route: "Parameters",
  });
  const [data, retry] = queryResolver.useContinuous<"GetParameters">({
    kind: "GetParameters",
    filter,
    pageSize,
    sort,
  });

  return (
    <PageContainer title={words("parameters.title")}>
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
        retry={retry}
        label="ParametersView"
        SuccessView={(parameters) =>
          parameters.data.length <= 0 ? (
            <EmptyView
              message={words("parameters.empty.message")}
              aria-label="ParametersView-Empty"
            />
          ) : (
            <ParametersTable
              rows={parameters.data}
              aria-label="ParametersView-Success"
              tablePresenter={new ParametersTablePresenter()}
              sort={sort}
              setSort={setSort}
            />
          )
        }
      />
    </PageContainer>
  );
};
