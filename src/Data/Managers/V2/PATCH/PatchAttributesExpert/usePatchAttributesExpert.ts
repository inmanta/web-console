import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";

import { useFetchHelpers } from "../../helpers";

export interface PatchAttributes {
  comment: string;
  attribute_set_name: string;
  current_version: ParsedNumber;
  edit: PatchEdit[];
  patch_id: string;
}

interface PatchEdit {
  edit_id: string;
  operation: string;
  target: string;
  value: unknown;
}

/**
 * 
 * @param environment 
 * @param instance_id 
 * @param service_entity 
 * @returns 
 */
export const usePatchAttributesExpert = (
  environment: string,
  instance_id: string,
  service_entity: string,
): UseMutationResult<void, Error, PatchAttributes, unknown> => {
  const { createHeaders, handleErrors } = useFetchHelpers();

  const headers = createHeaders(environment);
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );

  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const patchAttributesExpert = async (
    data: PatchAttributes,
  ): Promise<void> => {
    const response = await fetch(
      baseUrl +
        `/lsm/v2/service_inventory/${service_entity}/${instance_id}/expert`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
        headers,
      },
    );

    await handleErrors(response);
  };

  return useMutation({
    mutationFn: patchAttributesExpert,
    mutationKey: ["post_state_transfer"],
  });
};
