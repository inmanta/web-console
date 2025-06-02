import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { EnvironmentSettings } from "@/Core/Domain/EnvironmentSettings";
import { useGetWithOptionalEnv, KeyFactory, keySlices } from "@/Data/Queries";

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
  const keyFactory = new KeyFactory(keySlices.environment, "get_environment_setting");
  return {
    useOneTime: (): UseQueryResult<EnvironmentSettings, Error> =>
      useQuery({
        queryKey: keyFactory.single(env || "undefined"),
        queryFn: () => get("/api/v2/environment_settings"),
        retry: false,
        enabled: env !== undefined,
        select: (data) => {
          return data.data;
        },
      }),
  };
};
