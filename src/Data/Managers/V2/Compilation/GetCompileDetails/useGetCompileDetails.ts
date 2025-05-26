import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { CompileDetails } from "@/Slices/CompileDetails/Core/Domain";
import { DependencyContext } from "@/UI/Dependency";
import { CustomError, REFETCH_INTERVAL, useGet } from "../../helpers";
import { KeyFactory } from "@/Data/Managers/KeyFactory";

interface CompileDetailsParams {
  id: string;
}

interface ResponseBody {
  data: CompileDetails;
}

interface GetCompileDetails {
  useContinuous: () => UseQueryResult<ResponseBody, CustomError>;
}

function getUrl(params: CompileDetailsParams): string {
  return `/api/v2/compilereport/${encodeURIComponent(params.id)}`;
}

/**
 * React Query hook to fetch compile details
 *
 * @param params {CompileDetailsParams} - Parameters for the query
 *  @param {string} params.id - The ID of the compile report to fetch details for
 *
 * @returns {GetCompileDetails} An object containing the different available queries
 * @returns {UseQueryResult<ResponseBody, CustomError>} returns.useContinuous - Fetch compile details with a recursive query with an interval of 5s
 */
export const useGetCompileDetails = (params: CompileDetailsParams): GetCompileDetails => {
  const url = getUrl(params);
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<ResponseBody>;
  const key = new KeyFactory("compilation", "getCompileDetails");

  return {
    useContinuous: (): UseQueryResult<ResponseBody, CustomError> =>
      useQuery({
        queryKey: key.unique(params.id, [env]),
        queryFn: () => get(url),
        refetchInterval: REFETCH_INTERVAL,
        select: (data) => data,
      }),
  };
};
