import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

/**
 * Return Signature of the useGetInstance React Query
 */
interface GetJSONShema {
  useOneTime: () => UseQueryResult<unknown, Error>;
}

/**
 *  React Query hook to fetch JSON Schema for a service_entity.
 *
 * @param {string} service_id - The service entity.
 * @param {string} environment - The environment.
 *
 * @returns {GetJSONShema} The result of the query.
 * @returns {UseQueryResult<unknown, Error>} returns.useOneTime - Fetch the JSON Schema with a single query.
 */
export const useGetJSONSchema = (
  service_id: string,
  environment: string,
): GetJSONShema => {
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

    await handleErrors(
      response,
      `Failed to fetch JSON Schema for: ${service_id}`,
    );

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
