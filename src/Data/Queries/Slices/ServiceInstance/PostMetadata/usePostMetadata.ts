import { useContext } from "react";
import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";

interface PostMetadataInfo {
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
export const usePostMetadata = (): UseMutationResult<void, Error, PostMetadataInfo, unknown> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<PostMetadataInfo["body"]>;

  return useMutation({
    mutationFn: (info) =>
      post(
        `/lsm/v1/service_inventory/${info.service_entity}/${info.service_id}/metadata/${encodeURIComponent(info.key)}`,
        info.body
      ),
    mutationKey: ["post_metadata", env],
  });
};
