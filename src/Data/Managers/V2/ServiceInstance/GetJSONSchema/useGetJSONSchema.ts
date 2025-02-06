import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { useGet } from "../../helpers/useQueries";

/**
 * Return Signature of the useGetJSONSchema React Query
 */
interface GetJSONSchema {
  useOneTime: () => UseQueryResult<unknown, Error>;
}

/**
 *  React Query hook to fetch JSON Schema for a service_entity.
 *
 * @param {string} service_id - The service entity.
 *
 * @returns {GetJSONShema} The result of the query.
 * @returns {UseQueryResult<unknown, Error>} returns.useOneTime - Fetch the JSON Schema with a single query.
 */
export const useGetJSONSchema = (service_id: string): GetJSONSchema => {
  const get = useGet()<{ data: unknown }>;

  return {
    useOneTime: () =>
      useQuery({
        queryKey: ["get_JSON_schema-one_time", service_id],
        queryFn: () => get(`/lsm/v1/service_catalog/${service_id}/schema`),
        retry: false,
        select: (data) => data.data,
      }),
  };
};
