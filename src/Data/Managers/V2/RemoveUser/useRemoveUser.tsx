import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";

export const useRemoveUser = () => {
  const client = useQueryClient();
  const headers = useCreateHeaders();
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const deleteOrder = async (username: string): Promise<void> => {
    const response = await fetch(baseUrl + `/api/v2/user/${username}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error(JSON.parse(await response.text()).message);
    }
  };
  return useMutation({
    mutationFn: deleteOrder,
    mutationKey: ["removeUser"],
    onSuccess: () => {
      //refetch the users query to update the list
      client.invalidateQueries({ queryKey: ["get_users"] });
    },
  });
};
