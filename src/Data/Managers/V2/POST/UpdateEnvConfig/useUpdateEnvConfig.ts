import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { Dict } from "@/UI/Components";
import { useFetchHelpers } from "../../helpers";

interface ConfigUpdate {
  id: string;
  value: string | boolean | ParsedNumber | Dict;
}

/**
 * React Query hook for updating environment configuration settings.
 *
 * @param {string} environment  - The environment to use for creating headers.
 * @returns {UseMutationResult<void, Error, ConfigUpdate, unknown>}- The mutation object from `useMutation` hook.
 */
export const useUpdateEnvConfig = (
  environment: string,
): UseMutationResult<void, Error, ConfigUpdate, unknown> => {
  const client = useQueryClient();

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Update the environment configuration setting.
   *
   * @param {ConfigUpdate} configUpdate  - The info about the config setting to update
   *
   * @returns {Promise<void>} - The promise object of the fetch request.
   * @throws {Error} If the response is not successful, an error with the error message is thrown.
   */
  const updateConfig = async (configUpdate: ConfigUpdate): Promise<void> => {
    const { id, value } = configUpdate;

    const response = await fetch(
      baseUrl + `/api/v2/environment_settings/${id}`,
      {
        method: "POST",
        body: JSON.stringify({ value }),
        headers,
      },
    );

    await handleErrors(response);
  };

  return useMutation({
    mutationFn: updateConfig,
    mutationKey: ["update_env_config"],
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: ["get_env_config"], //for the future rework of the env getter
      });
      client.invalidateQueries({
        queryKey: ["get_env_details"], //for the future rework of the env getter
      });
      document.dispatchEvent(new Event("settings-update"));
    },
  });
};
