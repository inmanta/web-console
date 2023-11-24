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

/**
 * Wrapper for Pagination as we are basing ourselfs on links served by backend
 *
 * Note: Parameters responsible for pagination on endpoint doesn't allow to pass numerical range for displayed results, or any other way to navigate through pages other than previous/next page
 */
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
          titles={{ perPageSuffix: "" }}
          page={
            Math.floor(Number(metadata.before) / Number(metadata.page_size)) + 1
          }
          onNextClick={() =>
            setCurrentPage({
              kind: "CurrentPage",
              value: handlers.next ? handlers.next : "",
            })
          }
          onPreviousClick={() =>
            setCurrentPage({
              kind: "CurrentPage",
              value: handlers.prev ? handlers.prev : "",
            })
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
