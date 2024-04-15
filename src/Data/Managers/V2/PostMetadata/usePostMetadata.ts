import { useMutation } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";
import { useHandleErrors } from "../helpers/useHandleErrors";

export const usePostMetadata = (environment: string) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const { handleAuthorization } = useHandleErrors();
  const headers = useCreateHeaders(environment);
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
    handleAuthorization(response);

    if (!response.ok) {
      throw new Error(JSON.parse(await response.text()).message);
    }
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
