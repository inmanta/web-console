import { useContext } from "react";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Callback } from "@/Slices/ServiceDetails/Core/Callback";
import { DependencyContext } from "@/UI/Dependency";
import { CustomError, useGet } from "@/Data/Queries";

/**
 * interface of Response of the useGetCallbacks Query Call
 */
interface Response {
  data: Callback[];
}

/**
 * Return Signature of the useGetCallbacks React Query
 */
interface GetDesiredStates {
  useOneTime: () => UseQueryResult<Callback[], CustomError>;
}

/**
 * React Query hook to fetch a list of callbacks
 *
 * @returns {GetDesiredStates} An object containing the available queries.
 * @returns {UseQueryResult<Callback[], CustomError>} returns.useOneTime - Fetch the callbacks with a single query.
 */
export const useGetCallbacks = (): GetDesiredStates => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<Response>;

  return {
    useOneTime: (): UseQueryResult<Callback[], CustomError> =>
      useQuery({
        queryKey: ["get_callbacks-one_time", env],
        queryFn: () => get(getUrl()),
        select: (data) => data.data,
      }),
  };
};

export const getUrl = (): string => "/lsm/v1/callbacks";
