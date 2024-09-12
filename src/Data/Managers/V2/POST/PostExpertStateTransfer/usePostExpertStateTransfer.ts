import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";

import { useFetchHelpers } from "../../helpers";

export interface PostExpertStateTransfer {
  message: string;
  current_version: ParsedNumber;
  target_state: string;
  operation?: string;
}

export const usePostExpertStateTransfer = (
  environment: string,
  instance_id: string,
  service_entity: string,
): UseMutationResult<void, Error, PostExpertStateTransfer, unknown> => {
  const { createHeaders, handleErrors } = useFetchHelpers();

  const headers = createHeaders(environment);
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );

  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const postStateTransfer = async (
    data: PostExpertStateTransfer,
  ): Promise<void> => {
    const response = await fetch(
      baseUrl +
        `/lsm/v1/service_inventory/${service_entity}/${instance_id}/expert/state`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers,
      },
    );

    await handleErrors(response);
  };

  return useMutation({
    mutationFn: postStateTransfer,
    mutationKey: ["post_state_transfer"],
  });
};
