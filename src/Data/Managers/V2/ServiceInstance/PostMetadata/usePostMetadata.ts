import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { usePost } from "../../helpers/useQueries";

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
 * @returns {UseMutationResult<void, Error, PostMetadataInfo, unknown>}- The mutation object from `useMutation` hook.
 */
export const usePostMetadata = (): UseMutationResult<
  void,
  Error,
  PostMetadataInfo,
  unknown
> => {
  const post = usePost()<void, PostMetadataInfo>;

  return useMutation({
    mutationFn: (info) =>
      post(
        `/lsm/v1/service_inventory/${info.service_entity}/${info.service_id}/metadata/${info.key}`,
        info,
      ),
    mutationKey: ["post_metadata"],
  });
};
