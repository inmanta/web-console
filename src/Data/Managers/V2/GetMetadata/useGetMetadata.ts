import { useQuery } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";
import { useHandleErrors } from "../helpers/useHandleErrors";

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
  const { handleAuthorization } = useHandleErrors();
  const headers = useCreateHeaders(environment);
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
    handleAuthorization(response);

    if (!response.ok) {
      // If the value isn't set for given key we receive 404 which shouldn't break the flow of the application, as given endpoint doesn't serve critical data.
      if (response.status === 404) {
        return {
          data: undefined,
        };
      }
      throw new Error(JSON.parse(await response.text()).message);
    }
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
