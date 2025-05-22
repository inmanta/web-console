import qs from "qs";
import { urlEncodeParams } from "@/Data/Queries";
import { GetFactsParams } from "./useGetFacts";

/**
 * Get the URL for the GetFacts query
 * @param {GetFactsParams} params The parameters for the GetFacts query
 * @returns The URL for the GetFacts query
 */
export function getUrl(params: GetFactsParams): string {
  const { filter, pageSize, sort, currentPage } = urlEncodeParams<GetFactsParams>(params);

  const filterParam =
    filter && Object.keys(filter).length > 0
      ? `&${qs.stringify(
        {
          filter: {
            name: filter.name,
            resource_id: filter.resource_id,
          },
        },
        { allowDots: true, arrayFormat: "repeat" }
      )}`
      : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";

  return `/api/v2/facts?limit=${pageSize.value}${filterParam}${sortParam}${currentPage.value ? `&${currentPage.value}` : ""
    }`;
}
