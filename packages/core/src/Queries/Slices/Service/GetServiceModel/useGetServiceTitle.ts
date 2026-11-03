import { getServiceTitle } from "@inmanta/web-console-core";
import { useGetServiceModel } from "./useGetServiceModel";

/**
 * Returns the `web_title` of a service, or its name when it has none or while the service model
 * is loading or failed to load. It shares the cache of `useGetServiceModel`, so a page that
 * already loads the service sends no new request.
 */
export const useGetServiceTitle = (serviceName: string): string => {
  const { data } = useGetServiceModel(serviceName).useOneTime();

  return getServiceTitle(serviceName, data);
};
