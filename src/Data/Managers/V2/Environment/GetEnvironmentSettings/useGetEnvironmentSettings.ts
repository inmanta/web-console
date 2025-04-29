import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { EnvironmentSettings } from "@/Core/Domain/EnvironmentSettings";
import { DependencyContext } from "@/UI/Dependency";
import { useGet } from "../../helpers";

/**
 * Return Signature of the useGetEnvironmentSettings React Query
 */
interface GetEnvironmentSettings {
  useOneTime: () => UseQueryResult<EnvironmentSettings, Error>;
}

/**
 * React Query hook for fetching environment settings.
 *
 * @returns {GetEnvironmentSettings} An object containing the different available queries.
 * @returns {UseQueryResult<EnvironmentSettings, Error>} returns.useOneTime - Fetch environment settings with a single query.
 */
export const useGetEnvironmentSettings = (): GetEnvironmentSettings => {
  const get = useGet()<{ data: EnvironmentSettings }>;
  const { environmentModifier } = useContext(DependencyContext);
  return {
    useOneTime: (): UseQueryResult<EnvironmentSettings, Error> =>
      useQuery({
        queryKey: ["get_environment_settings-one_time"],
        queryFn: () => get("/api/v2/environment_settings"),
        retry: false,
        select: (data) => {
          environmentModifier.setEnvironmentSettings(data.data);
          return data.data;
        },
      }),
  };
};
