import React from "react";
import { Pagination as PaginationComponent } from "@patternfly/react-core";
import { PageSize, Pagination } from "@/Core";
import { PaginationPageSizes } from "@/Core/Domain/PageSize";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";

type Data = {
  handlers: Pagination.Handlers;
  metadata: Pagination.Metadata;
};

interface Props {
  data: Data;
  pageSize: PageSize.Type;
  setPageSize: (size: PageSize.Type) => void;
  setCurrentPage: (currentPage: CurrentPage) => void;
  isDisabled?: boolean;
  variant?: "top" | "bottom";
}

/**
 * Pagination wrapper around PatternFly Pagination.
 *
 * Uses backend-driven pagination with cursor-based navigation (next/previous handlers)
 * instead of numeric page indexing.
 *
 * @props {Props} props - The props of the component.
 *  @prop {Data} data - Backend pagination data containing metadata and navigation handlers.
 *  @prop {Pagination.Handlers} data.handlers - Cursor-based navigation links (next/prev).
 *  @prop {Pagination.Metadata} data.metadata - Pagination metadata (total, page size, offsets).
 *  @prop {PageSize.Type} pageSize - Current page size configuration.
 *  @prop {(size: PageSize.Type) => void} setPageSize - Updates the number of items per page.
 *  @prop {(currentPage: CurrentPage) => void} setCurrentPage - Updates pagination cursor/page.
 *  @prop {boolean} [isDisabled] - Disables pagination interactions during loading states.
 *  @prop {"top" | "bottom"} [variant] - Visual placement variant of the pagination component.
 */
export const Provider: React.FC<Props> = ({
  data,
  pageSize,
  setPageSize,
  setCurrentPage,
  isDisabled = false,
  variant = "top",
}) => {
  const { handlers, metadata } = data;

  return (
    <PaginationComponent
      style={{ pointerEvents: isDisabled ? "none" : "auto" }}
      itemCount={Number(metadata.total)}
      perPage={Number(pageSize.value)}
      titles={{
        perPageSuffix: "",
        paginationAriaLabel: `${variant}-Pagination`,
      }}
      page={Math.floor(Number(metadata.before) / Number(metadata.page_size)) + 1}
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
      aria-label={`PaginationWidget-${variant}`}
      widgetId={`PaginationWidget-${variant}`}
      onPerPageSelect={(
        _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
        newPerPage: number
      ) => {
        //default Pagination value are set to match PageSize.Type, but they are converted to numbers "under the hood"
        setPageSize({
          kind: "PageSize",
          value: newPerPage.toString() as unknown as PageSize.PageSize["value"],
        });
      }}
      perPageOptions={PaginationPageSizes}
      isCompact
      variant={variant}
    />
  );
};
