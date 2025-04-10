import { GetResourceHistoryParams } from "./useGetResourceHistory";

/**
 * Constructs a URL for fetching resource history with sorting and pagination
 *
 * @param {GetResourceHistoryParams} params - The query parameters
 * @returns {string} The constructed URL
 */
export const getUrl = ({
  id,
  pageSize,
  sort,
  currentPage,
}: GetResourceHistoryParams): string => {
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";

  return `/api/v2/resource/${id}/history?limit=${pageSize.value}${sortParam}${
    currentPage.value ? `&${currentPage.value}` : ""
  }`;
};
