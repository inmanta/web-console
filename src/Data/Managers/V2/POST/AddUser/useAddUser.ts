import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePost } from "../../helpers/useQueries";

interface AddUSerResponse {
  data: {
    username: "string";
    auth_method: "database";
  };
}

interface AddUserBody {
  username: string;
  password: string;
}

/**
 * React Query hook for adding a user.
 * @returns {Mutation} The mutation object for adding a user.
 */
export const useAddUser = () => {
  const client = useQueryClient();
  const post = usePost()<AddUSerResponse, AddUserBody>;

  return useMutation({
    mutationFn: (body: AddUserBody) => post(`/api/v2/user`, body),
    mutationKey: ["add_user"],
    onSuccess: () => {
      //refetch the users query to update the list
      client.invalidateQueries({ queryKey: ["get_users-one_time"] });
    },
  });
};
