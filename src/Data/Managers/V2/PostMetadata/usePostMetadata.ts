import { useMutation } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

export const usePostMetadata = (environment: string) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const postMetadata = async (info: {
    service_entity: string;
    service_id: string;
    key: string;
    body: {
      current_version: number;
      value: string;
    };
  }): Promise<void> => {
    const { service_entity, service_id, key, body } = info;
    const response = await fetch(
      baseUrl +
        `/lsm/v1/service_inventory/${service_entity}/${service_id}/metadata/${key}`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers,
      },
    );

    await handleErrors(response);
  };

  return useMutation({
    mutationFn: postMetadata,
    mutationKey: ["post_metadata"],
    onError: (error) => {
      setTimeout(() => {
        document.dispatchEvent(
          new CustomEvent("show_alert-global", {
            detail: error,
          }),
        );
      }, 1000);
    },
  });
};
