import React from "react";
import { Pagination as PaginationComponent } from "@patternfly/react-core";
import styled from "styled-components";
import { PageSize, Pagination } from "@/Core";
import { PaginationPageSizes } from "@/Core/Domain/PageSize";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";

/**
 * Stand-in for the total while it loads. The font's digits differ in width and 8 is about the average,
 * so this is as wide as a typical 5-digit total and the widget barely shifts when the total arrives.
 */
const LOADING_COUNT_GHOST = "88888";

/** A bold, invisible total on a placeholder background, as wide as the total it stands in for. */
const LoadingCount = styled.b`
  color: transparent;
  border-radius: var(--pf-t--global--border--radius--small);
  background-color: var(--pf-t--global--background--color--secondary--default);
`;

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
  isLoading?: boolean;
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
 *  @prop {boolean} [isLoading] - Shows the range of the page with a placeholder for the total, and disables the controls.
 *  @prop {"top" | "bottom"} [variant] - Visual placement variant of the pagination component.
 */
export const Provider: React.FC<Props> = ({
  data,
  pageSize,
  setPageSize,
  setCurrentPage,
  isDisabled = false,
  isLoading = false,
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
      isDisabled={isLoading}
      toggleTemplate={
        isLoading
          ? ({ firstIndex, lastIndex, ofWord, itemsTitle }) => (
              // Same markup as PatternFly's default template, with the total swapped for a placeholder.
              <>
                <b>
                  {firstIndex} - {lastIndex}
                </b>{" "}
                {ofWord} <LoadingCount>{LOADING_COUNT_GHOST}</LoadingCount> {itemsTitle}
              </>
            )
          : undefined
      }
      variant={variant}
    />
  );
};
