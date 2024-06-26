import { useQuery } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

export const useGetMetadata = (
  environment: string,
  service_entity: string,
  service_id: string,
  instanceVersion: ParsedNumber | undefined,
  key: string,
) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const getMetadata = async (): Promise<{
    data: string | undefined;
  }> => {
    const response = await fetch(
      baseUrl +
        `/lsm/v1/service_inventory/${service_entity}/${service_id}/metadata/${key}?current_version=${instanceVersion}`,
      {
        headers,
      },
    );

    // If the value isn't set for given key we receive 404 which shouldn't break the flow of the application, as given endpoint doesn't serve critical data.
    if (response.status === 404) {
      return {
        data: undefined,
      };
    }
    await handleErrors(response);

    return response.json();
  };

  return {
    useOneTime: () =>
      useQuery({
        queryFn: getMetadata,
        queryKey: [
          "get_metadata",
          service_entity,
          service_id,
          key,
          environment,
          instanceVersion,
        ],
        retry: false,
        enabled: instanceVersion !== undefined,
      }),
  };
};
