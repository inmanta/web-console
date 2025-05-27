import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";
import { CustomError, REFETCH_INTERVAL, useHead } from "../../helpers";

type HookResponse = {
  isCompiling: boolean;
};

interface GetCompilerStatus {
  useContinuous: () => UseQueryResult<HookResponse, CustomError>;
}

function getUrl(env: string): string {
  return `/api/v1/notify/${env}`;
}

/**
 * React Query hook to fetch compiler status
 *
 * @returns {GetCompilerStatus} An object containing the different available queries
 * @returns {UseQueryResult<HookResponse, CustomError>} returns.useOneTime - Fetch compiler status with a single query
 * @returns {UseQueryResult<HookResponse, CustomError>} returns.useContinuous - Fetch compiler status with a recursive query with an interval of 5s
 */
export const useGetCompilerStatus = (): GetCompilerStatus => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const url = getUrl(env);
  const head = useHead();
  const keyFactory = new KeyFactory(keySlices.compilation, "get_compiler_status");

  return {
    useContinuous: (): UseQueryResult<HookResponse, CustomError> =>
      useQuery({
        queryKey: keyFactory.single(env),
        queryFn: () => head(url),
        select: (response) => ({
          isCompiling: response.status === 200,
        }),
        refetchInterval: REFETCH_INTERVAL,
      }),
  };
};
