import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
} from "@tanstack/react-query";
import { useGetZipWithoutEnv } from "../../helpers";

/**
 * React Query hook for downloading support archive.
 *
 * @returns {UseMutationResult<Blob, Error>} A mutation result containing the support archive blob or an error.
 */
export const useGetSupportArchive = (
  options?: UseMutationOptions<Blob, Error>,
): UseMutationResult<Blob, Error, void> => {
  const get = useGetZipWithoutEnv();

  return useMutation({
    mutationFn: async () => {
      const response = await get("/api/v2/support");

      return response;
    },
    ...options,
  });
};
