import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { Callback } from "@/Slices/ServiceDetails/Core/Callback";
import { CustomError, useGet } from "../../helpers";

/**
 * interface of Result of the useGetCallbacks React Query
 */
interface Result {
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
  const get = useGet()<Result>;

  return {
    useOneTime: (): UseQueryResult<Callback[], CustomError> =>
      useQuery({
        queryKey: ["get_callbacks-one_time"],
        queryFn: () => get(getUrl()),
        select: (data) => data.data,
      }),
  };
};

export const getUrl = (): string => "/lsm/v1/callbacks";
