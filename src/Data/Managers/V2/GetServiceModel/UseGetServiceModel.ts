import { useQuery } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";
import { useHandleErrors } from "../helpers/useHandleErrors";

export const useGetServiceModel = (service: string, environment: string) => {
  const headers = useCreateHeaders(environment);
  const { handleAuthorization } = useHandleErrors();

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  // /lsm/v1/service_catalog/{service_entity}
  const fetchInstance = async () => {
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_catalog/${service}`,
      {
        headers,
      },
    );

    handleAuthorization(response);

    if (!response.ok) {
      throw new Error(`"Failed to fetch Service Model for: ${service}`);
    }

    return response.json();
  };

  return {
    useOneTime: () =>
      useQuery({
        queryKey: ["get_service_model-one_time", service],
        queryFn: fetchInstance,
        retry: false,
        select: (data) => data.data,
      }),
    useContinuous: () =>
      useQuery({
        queryKey: ["get_service_model-continuous", service],
        queryFn: fetchInstance,
        refetchInterval: 5000,
        select: (data) => data.data,
      }),
  };
};
