import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { CustomError, useGetZipWithoutEnv } from "@/Data/Queries/Helpers";

/**
 * React Query hook for downloading support archive.
 *
 * @returns {UseMutationResult<Blob, CustomError>} A mutation result containing the support archive blob or an error.
 */
export const useCreateSupportArchive = (
  options?: UseMutationOptions<Blob, CustomError>
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
