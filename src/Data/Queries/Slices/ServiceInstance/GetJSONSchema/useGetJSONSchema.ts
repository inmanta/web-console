import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { CustomError, useGet, KeyFactory, SliceKeys } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";

/**
 * Return Signature of the useGetJSONSchema React Query
 */
interface GetJSONSchema {
  useOneTime: () => UseQueryResult<unknown, CustomError>;
}

/**
 *  React Query hook to fetch JSON Schema for a service_entity.
 *
 * @param {string} service_id - The service entity.
 *
 * @returns {GetJSONShema} The result of the query.
 * @returns {UseQueryResult<unknown, CustomError>} returns.useOneTime - Fetch the JSON Schema with a single query.
 */
export const useGetJSONSchema = (service_id: string): GetJSONSchema => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<{ data: unknown }>;

  return {
    useOneTime: () =>
      useQuery({
        queryKey: getJSONSchemaFactory.single(service_id, [env]),
        queryFn: () => get(`/lsm/v1/service_catalog/${service_id}/schema`),
        select: (data) => data.data,
      }),
  };
};

export const getJSONSchemaFactory = new KeyFactory(SliceKeys.serviceInstance, "get_JSON_schema");
