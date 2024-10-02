import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";

import { useFetchHelpers } from "../../helpers";

/**
 * Required attributes to construct the patch request to edit an instance attribute set in Expert mode
 */
export interface ExpertPatchAttributes {
  comment: string;
  attribute_set_name: string;
  current_version: ParsedNumber;
  edit: PatchEdit[];
  patch_id: string;
}

/**
 * Edit content for a patch request
 */
interface PatchEdit {
  edit_id: string;
  operation: string;
  target: string;
  value: unknown;
}

/**
 * React Query to Patch the attributes of a certain set, for an instance, in expert mode.
 *
 * @param {string} environment - The Environment where the instance is located
 * @param {string} instance_id - the UUID of the instance
 * @param {string } service_entity - The service entity type of the instance
 * @returns {UseMutationResult<void, Error, ExpertPatchAttributes, unknown>} The useMutation ReactQuery Hook
 */
export const usePatchAttributesExpert = (
  environment: string,
  instance_id: string,
  service_entity: string,
): UseMutationResult<void, Error, ExpertPatchAttributes, unknown> => {
  const { createHeaders, handleErrors } = useFetchHelpers();

  const headers = createHeaders(environment);
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );

  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Expert Edit an instance.
   *
   * @returns {Promise<void>} - A promise that resolves when the instance is succesfully edited in Expert mode.
   */
  const patchAttributesExpert = async (
    data: ExpertPatchAttributes,
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
    mutationKey: ["patch_expert_edit"],
  });
};
