import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { DependencyContext } from "@/UI/Dependency";
import { CustomError, useHead } from "../../helpers";

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

  return {
    useContinuous: (): UseQueryResult<HookResponse, CustomError> =>
      useQuery({
        queryKey: ["get_compiler_status-continuous"],
        queryFn: () => head(url),
        select: (response) => ({
          isCompiling: response.status === 200,
        }),
        refetchInterval: 2000,
      }),
  };
};
