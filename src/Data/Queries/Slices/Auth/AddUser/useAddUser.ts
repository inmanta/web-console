import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePostWithoutEnv } from "@/Data/Queries";
import { getUserFactory } from "../GetUsers/useGetUsers";

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
  const post = usePostWithoutEnv()<AddUserBody>;

  return useMutation<AddUSerResponse, Error, AddUserBody>({
    mutationFn: (body) => post("/api/v2/user", body),
    mutationKey: ["add_user"],
    onSuccess: () => {
      //refetch the users query to update the list
      client.invalidateQueries({ queryKey: getUserFactory.root() });
    },
  });
};
