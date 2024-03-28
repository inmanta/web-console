import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";
import { useHandleErrors } from "../helpers/useHandleErrors";

/**
 * Custom hook for adding a user.
 * @returns {Mutation} The mutation object for adding a user.
 */
export const useAddUser = () => {
  const { handleAuthorization } = useHandleErrors();
  const client = useQueryClient();
  const headers = useCreateHeaders();
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Function for making a POST request to add a user.
   * @param {Object} orderBody - The body of the POST request.
   * @param {string} orderBody.username - The username of the user.
   * @param {string} orderBody.password - The password of the user.
   * @returns {Promise<Object>} The response object containing the added user's information.
   * @throws {Error} If the response is not successful, an error is thrown with the error message.
   */
  const postOrder = async (orderBody: {
    username: string;
    password: string;
  }): Promise<{
    data: {
      username: string;
      auth_method: string;
    };
  }> => {
    const response = await fetch(baseUrl + `/api/v2/user`, {
      method: "POST",
      body: JSON.stringify(orderBody),
      headers,
    });
    handleAuthorization(response);
    if (!response.ok) {
      throw new Error(JSON.parse(await response.text()).message);
    }
    return response.json();
  };

  return useMutation({
    mutationFn: postOrder,
    mutationKey: ["add_user"],
    onSuccess: () => {
      //refetch the users query to update the list
      client.invalidateQueries({ queryKey: ["get_users-one_time"] });
    },
  });
};
