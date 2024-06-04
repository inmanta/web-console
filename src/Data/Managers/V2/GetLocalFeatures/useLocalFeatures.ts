import { useQuery } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";

export const useLocalFeatures = () => {
  const headers = useCreateHeaders();

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const fetchLocalFeatures = async () => {
    const response = await fetch(`${baseUrl}/console/data.json`, {
      headers,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch local features");
    }

    return response.json();
  };

  return {
    useOneTime: () =>
      useQuery({
        queryKey: ["get_local_features-one_time"],
        queryFn: fetchLocalFeatures,
        retry: false,
      }),
  };
};
