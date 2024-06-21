import { useQuery } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

/**
 *  React Query hook to fetch JSON Schema for a service_entity.
 *
 * @param {string} service_id - The service entity.
 * @param {string} environment - The environment.
 *
 * @returns {Object} The result of the query, {data, status, error, isLoading}.
 */
export const useGetJSONSchema = (service_id: string, environment: string) => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  // [GET] /lsm/v1/service_catalog/<service_entity>/schema
  const fetchJSONSchema = async (): Promise<{
    data: unknown;
  }> => {
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_catalog/${service_id}/schema`,
      {
        headers,
      },
    );

    handleErrors(response, `Failed to fetch JSON Schema for: ${service_id}`);

    return response.json();
  };

  return {
    useOneTime: () =>
      useQuery({
        queryKey: ["get_JSON_schema-one_time", service_id, environment],
        queryFn: fetchJSONSchema,
        retry: false,
        select: (data) => data.data,
      }),
  };
};
