import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { EnvironmentSettings } from "@/Core/Domain/EnvironmentSettings";
import { useGet, useGetWithoutEnv } from "../../helpers";

/**
 * Return Signature of the useGetEnvironmentSettings React Query
 */
interface GetEnvironmentSettings {
  useOneTime: (envId: string) => UseQueryResult<EnvironmentSettings, Error>;
}

/**
 * React Query hook for fetching environment settings.
 *
 * @returns {GetEnvironmentSettings} An object containing the different available queries.
 * @returns {UseQueryResult<EnvironmentSettings, Error>} returns.useOneTime - Fetch environment settings with a single query.
 */
export const useGetEnvironmentSettings = (): GetEnvironmentSettings => {
  const get = useGetWithoutEnv()<{ data: EnvironmentSettings }>;

  return {
    useOneTime: (envId: string): UseQueryResult<EnvironmentSettings, Error> =>
      useQuery({
        queryKey: ["get_environment_settings-one_time", envId],
        queryFn: () => get(`/api/v2/environment_settings/${envId}`),
        retry: false,
        select: (data) => data.data,
      }),
  };
};
