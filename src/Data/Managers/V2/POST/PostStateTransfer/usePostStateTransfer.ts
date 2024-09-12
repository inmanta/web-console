import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";

import { useFetchHelpers } from "../../helpers";

export interface PostStateTransfer {
  message: string;
  current_version: ParsedNumber;
  target_state: string;
}

export const usePostStateTransfer = (
  environment: string,
  instance_id: string,
  service_entity: string,
): UseMutationResult<void, Error, PostStateTransfer, unknown> => {
  const { createHeaders, handleErrors } = useFetchHelpers();

  const headers = createHeaders(environment);
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );

  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const postStateTransfer = async (data: PostStateTransfer): Promise<void> => {
    console.log(data);
    const response = await fetch(
      baseUrl +
        `/lsm/v1/service_inventory/${service_entity}/${instance_id}/state`,
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
