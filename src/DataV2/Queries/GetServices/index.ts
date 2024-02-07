import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { ServiceModel } from "@/Core";
import { DependencyContext } from "@/UI";

export const useGetServices = () => {
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const fetchServices = async (): Promise<{ data: ServiceModel[] }> => {
    const response = await fetch(
      "http://localhost:8010/proxy/lsm/v1/service_catalog?instance_summary=True",
      {
        headers: new Headers({
          "X-Inmanta-Tid": environment,
        }),
      },
    );
    if (response.ok) {
      return response.json();
    }
    const error = await response.json();
    throw new Error(error.message);
  };

  return {
    useContinuous: () => {
      return useQuery({
        queryKey: ["get_services-continuous"],
        queryFn: fetchServices,
        refetchInterval: (query) =>
          query.state.status === "error" ? false : 5000,
        retry: false,
        select: (data) => data.data,
      });
    },
    useOneTime: () => {
      return useQuery({
        queryKey: ["get_services-one_time"],
        queryFn: fetchServices,
        retry: false,
        select: (data) => data.data,
      });
    },
  };
};
