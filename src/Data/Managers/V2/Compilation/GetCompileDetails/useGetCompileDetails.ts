import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { CompileDetails } from "@/Slices/CompileDetails/Core/Domain";
import { useGet } from "../../helpers";

interface CompileDetailsParams {
  id: string;
}

interface ResponseBody {
  data: CompileDetails;
}

interface GetCompileDetails {
  useOneTime: () => UseQueryResult<ResponseBody, Error>;
  useContinuous: () => UseQueryResult<ResponseBody, Error>;
}

function getUrl(params: CompileDetailsParams): string {
  return `/api/v2/compilereport/${params.id}`;
}

/**
 * React Query hook to fetch compile details
 *
 * @param params {CompileDetailsParams} - Parameters for the query
 *  @param {string} params.id - The ID of the compile report to fetch details for
 *
 * @returns {GetCompileDetails} An object containing the different available queries
 * @returns {UseQueryResult<ResponseBody, Error>} returns.useOneTime - Fetch compile details with a single query
 * @returns {UseQueryResult<ResponseBody, Error>} returns.useContinuous - Fetch compile details with a recursive query with an interval of 5s
 */
export const useGetCompileDetails = (
  params: CompileDetailsParams,
): GetCompileDetails => {
  const url = getUrl(params);
  const get = useGet()<ResponseBody>;

  return {
    useOneTime: (): UseQueryResult<ResponseBody, Error> =>
      useQuery({
        queryKey: ["get_compile_details-one_time", params.id],
        queryFn: () => get(url),
        retry: false,
        select: (data) => data,
      }),
    useContinuous: (): UseQueryResult<ResponseBody, Error> =>
      useQuery({
        queryKey: ["get_compile_details-continuous", params.id],
        queryFn: () => get(url),
        refetchInterval: 5000,
        select: (data) => data,
      }),
  };
};
