import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { EnvironmentSettings } from "@/Core/Domain/EnvironmentSettings";
import { useGetWithOptionalEnv } from "../../helpers";

/**
 * Return Signature of the useGetEnvironmentSettings React Query
 */
interface GetEnvironmentSettings {
  useOneTime: (env?: string) => UseQueryResult<EnvironmentSettings, Error>;
}

/**
 * React Query hook for fetching environment settings.
 *
 * @returns {GetEnvironmentSettings} An object containing the different available queries.
 * @returns {UseQueryResult<EnvironmentSettings, Error>} returns.useOneTime - Fetch environment settings with a single query.
 */
export const useGetEnvironmentSettings = (env?: string): GetEnvironmentSettings => {
  const get = useGetWithOptionalEnv(env)<{ data: EnvironmentSettings }>;
  return {
    useOneTime: (): UseQueryResult<EnvironmentSettings, Error> =>
      useQuery({
        queryKey: ["get_environment_settings-one_time", env],
        queryFn: () => get("/api/v2/environment_settings"),
        retry: false,
        enabled: env !== undefined,
        select: (data) => {
          return data.data;
        },
      }),
  };
};
