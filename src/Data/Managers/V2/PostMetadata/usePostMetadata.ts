/**
 * Custom hook for posting metadata.
 *
 * @param environment - The environment to use for creating headers.
 * @returns - The mutation object from `useMutation` hook.
 */
import { useMutation } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

interface PostMetadataInfo {
  service_entity: string;
  service_id: string;
  key: string;
  body: {
    current_version: number;
    value: string;
  };
}

export const usePostMetadata = (environment: string) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Posts metadata.
   *
   * @param info - The metadata information to post.
   */
  const postMetadata = async (info: PostMetadataInfo): Promise<void> => {
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
  });
};
