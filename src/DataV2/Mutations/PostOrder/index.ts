import { useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { DependencyContext } from "@/UI";
import { InstanceForApi } from "@/UI/Components/Diagram/interfaces";

export const usePostServices = () => {
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const postOrder = async (
    orderBody: InstanceForApi[],
  ): Promise<InstanceForApi[]> => {
    // Perform the mutation logic, e.g., make an API request to update the user
    const response = await fetch("http://localhost:8010/proxy/lsm/v2/order", {
      method: "POST",
      body: JSON.stringify({ service_order_items: orderBody }),
      headers: {
        "Content-Type": "application/json",
        "X-Inmanta-tid": environment,
      },
    });

    if (!response.ok) {
      throw new Error(JSON.parse(await response.text()).message);
    }

    return response.json();
  };

  return useMutation({ mutationFn: postOrder, mutationKey: ["post_order"] });
};
