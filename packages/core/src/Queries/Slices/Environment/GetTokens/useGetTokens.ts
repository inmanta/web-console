import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { Token } from "@inmanta/web-console-core/Domain";
import { useGet } from "@inmanta/web-console-core/Queries/Helpers";
import { KeyFactory, SliceKeys } from "@inmanta/web-console-core/Queries/Helpers/KeyFactory";

export const getTokensKey = new KeyFactory(SliceKeys.environment, "get_tokens");

/**
 * React Query hook to fetch the registered (revocable) tokens of the current environment.
 *
 * @returns An object with a `useOneTime` hook returning the list of tokens.
 */
export const useGetTokens = () => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<{ data: Token[] }>;

  return {
    useOneTime: () =>
      useQuery({
        queryKey: getTokensKey.list([env]),
        queryFn: () => get("/api/v2/environment_auth"),
        select: (data) => data.data,
      }),
  };
};
