import React from "react";
import { Pagination as PaginationComponent } from "@patternfly/react-core";
import styled from "styled-components";
import { PageSize, Pagination, RemoteData } from "@/Core";
import { PaginationPageSizes } from "@/Core/Domain/PageSize";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";

type Data = RemoteData.Type<
  string,
  {
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  }
>;

interface Props {
  data: Data;
  pageSize: PageSize.Type;
  setPageSize: (size: PageSize.Type) => void;
  setCurrentPage: (currentPage: CurrentPage) => void;
}

export const Provider: React.FC<Props> = ({
  data,
  pageSize,
  setPageSize,
  setCurrentPage,
}) =>
  RemoteData.fold(
    {
      notAsked: () => <Filler />,
      loading: () => <Filler />,
      failed: () => <Filler />,
      success: ({ handlers, metadata }) => (
        <StyledPagination
          itemCount={Number(metadata.total)}
          perPage={Number(pageSize.value)}
          page={
            Math.floor(Number(metadata.before) / Number(metadata.page_size)) + 1
          }
          onNextClick={() =>
            handlers.next
              ? setCurrentPage({ kind: "CurrentPage", value: handlers.next })
              : undefined
          }
          onPreviousClick={() =>
            //prev could be also empty string
            handlers.prev !== undefined
              ? setCurrentPage({ kind: "CurrentPage", value: handlers.prev })
              : undefined
          }
          aria-label="PaginationWidget"
          onPerPageSelect={(
            _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
            newPerPage: number,
          ) => {
            //default Pagination value are set to match PageSize.Type, but they are converted to numbers "under the hood"
            setPageSize({
              kind: "PageSize",
              value:
                newPerPage.toString() as unknown as PageSize.PageSize["value"],
            });
          }}
          perPageOptions={PaginationPageSizes}
          isCompact
        />
      ),
    },
    data,
  );
const Filler = styled.div`
  height: 36px;
  width: 264px;
`;

const StyledPagination = styled(PaginationComponent)`
  .pf-v5-c-pagination__nav {
    //overwrite display, as by default navigation will hide on small resolutions
    display: flex;
  }
`;
