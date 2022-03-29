import { createContext } from "react";

interface GetInstancesProvider {
  refetch: () => void;
}

export const GetInstancesContext = createContext<GetInstancesProvider>({
  refetch: () => null,
});
