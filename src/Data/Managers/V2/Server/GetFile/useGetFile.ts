import { useMutation } from "@tanstack/react-query";
import { words } from "@/UI";
import { useGet } from "../../helpers/useQueries";

interface RawResponse {
  content?: string;
  message?: string;
}

/**
 * Fetches a file from the server and returns the content as a string.
 * @param fileId - The ID of the file to fetch.
 * @returns A string containing the file content.
 */
export const useGetFile = (fileId: string) => {
  const sanitizeFileId = (fileId: string): string => {
    return window.encodeURIComponent(fileId);
  };
  const get = useGet()<RawResponse>;

  return useMutation({
    mutationKey: ["get_file", fileId],
    mutationFn: async () => {
      const data = await get(`/api/v1/file/${sanitizeFileId(fileId)}`);

      if (typeof data.message !== "undefined") {
        return data.message;
      }

      if (typeof data.content !== "undefined") {
        // decode base64 string
        try {
          return window.atob(data.content);
        } catch (_e) {
          return data.content;
        }
      }

      return words("noData");
    },
  });
};
