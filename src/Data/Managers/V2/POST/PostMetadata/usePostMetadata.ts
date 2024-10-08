import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../../helpers";

export interface PostMetadataInfo {
  service_entity: string;
  service_id: string;
  key: string;
  body: {
    current_version: ParsedNumber;
    value: string;
  };
}

/**
 * React Query hook for posting metadata.
 *
 * @param {string} environment  - The environment to use for creating headers.
 * @returns {UseMutationResult<void, Error, PostMetadataInfo, unknown>}- The mutation object from `useMutation` hook.
 */
export const usePostMetadata = (
  environment: string,
): UseMutationResult<void, Error, PostMetadataInfo, unknown> => {
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
   * @param info {PostMetadataInfo} - The metadata information to post.
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
