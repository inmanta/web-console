import { useQuery } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";
import { useHandleErrors } from "../helpers/useHandleErrors";

export const useGetInstance = (
  service: string,
  instance: string,
  environment: string,
) => {
  const headers = useCreateHeaders(environment);
  const { handleAuthorization } = useHandleErrors();

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  // /lsm/v1/service_inventory/{service_entity}/{service_id}
  const fetchInstance = async () => {
    const response = await fetch(
      `${baseUrl}/lsm/v1/service_inventory/${service}/${instance}`,
      {
        headers,
      },
    );

    handleAuthorization(response);

    if (!response.ok) {
      throw new Error("Failed to fetch instance");
    }

    return response.json();
  };

  return {
    useOneTime: () =>
      useQuery({
        queryKey: ["get_instance-one_time", service, instance],
        queryFn: fetchInstance,
        retry: false,
        select: (data) => data.data,
      }),
    useContinuous: () =>
      useQuery({
        queryKey: ["get_instance-continuous", service, instance],
        queryFn: fetchInstance,
        refetchInterval: 5000,
        select: (data) => data.data,
      }),
  };
};
