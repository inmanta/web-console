import { useMutation } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";

export const useLogin = () => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );

  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const postOrder = async (orderBody: {
    username: string;
    password: string;
  }): Promise<{
    data: {
      token: string;
      user: {
        username: string;
        auth_method: string;
      };
    };
  }> => {
    // Perform the mutation logic, e.g., make an API request to update the user
    const response = await fetch(baseUrl + "/api/v2/login", {
      method: "POST",
      body: JSON.stringify(orderBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(JSON.parse(await response.text()).message);
    }

    return response.json();
  };

  return useMutation({ mutationFn: postOrder, mutationKey: ["login"] });
};
