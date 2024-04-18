import { useMutation } from "@tanstack/react-query";
import { words } from "lodash";
import { PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";
import { useHandleErrors } from "../helpers/useHandleErrors";

/**
 * Custom hook for posting metadata for a service instance.
 * @param environment - The environment for which the metadata is being posted.
 * @returns - The mutation function for posting metadata.
 */
export const usePostMetadata = (environment: string) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const { handleAuthorization } = useHandleErrors();
  const headers = useCreateHeaders(environment);
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Posts metadata for a service instance.
   * @param service_entity - The service entity.
   * @param service_id - The service ID.
   * @param key - The metadata key.
   * @param body.current_version - The current version of the instance.
   * @param body.value - The value of the metadata.
   * @throws - If the response is not successful, an error is thrown with the error message.
   */
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
            detail: {
              ...error,
              title: words("inventory.instanceComposer.failed.title"),
            },
          }),
        );
      }, 1000);
    },
  });
};
