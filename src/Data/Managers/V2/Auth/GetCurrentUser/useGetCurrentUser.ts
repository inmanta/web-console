import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { useGetWithoutEnv } from "../../helpers";

interface LoggedUser {
  username: string;
}

/**
 * React Query hook for getting the current logged in user from the server.
 *
 * @returns {Query} - An object containing a custom hook to fetch user information.
 */
export const useGetCurrentUser = () => {
  const url = `/api/v2/current_user`;
  const get = useGetWithoutEnv()<{ data: LoggedUser }>;

  return {
    /**
     * Custom hook to fetch the user information from the API once.
     * @returns {UseQueryResult<LoggedUser, Error>} The result of the query, including the current user information.
     */
    useOneTime: (): UseQueryResult<LoggedUser, Error> =>
      useQuery({
        queryFn: () => get(url),
        queryKey: ["get_current_user"],
        select: (data) => data.data,
      }),
  };
};
