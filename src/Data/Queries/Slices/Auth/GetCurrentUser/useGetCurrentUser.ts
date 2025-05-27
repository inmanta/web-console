import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { CustomError, useGetWithoutEnv } from "@/Data/Queries";

interface LoggedUser {
  username: string;
}

/**
 * React Query hook for getting the current logged in user from the server.
 *
 * @returns {Query} - An object containing a custom hook to fetch user information.
 */
export const useGetCurrentUser = () => {
  const url = "/api/v2/current_user";
  const get = useGetWithoutEnv()<{ data: LoggedUser }>;
  const keyFactory = new KeyFactory(keySlices.auth, "get_current_user");

  return {
    /**
     * Custom hook to fetch the user information from the API once.
     * @returns {UseQueryResult<LoggedUser, CustomError>} The result of the query, including the current user information.
     */
    useOneTime: (): UseQueryResult<LoggedUser, CustomError> =>
      useQuery({
        queryFn: () => get(url),
        queryKey: keyFactory.single("get_user"),
        select: (data) => data.data,
      }),
  };
};
