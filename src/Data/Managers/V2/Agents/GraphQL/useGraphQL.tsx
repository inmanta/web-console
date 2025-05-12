import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../../helpers";

interface Props {
  envID: string | null;
  cleared: boolean;
  orderBy: "asc" | "desc";
}

export const useGraphQL = (props: Props) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { createHeaders } = useFetchHelpers();
  const headers = createHeaders();
  headers.set("Content-Type", "application/graphql");

  const query = gql`
    query {
      notifications(
        filter: { cleared: ${props.cleared}, environment: "${props.envID}" }
        orderBy: { created: "${props.orderBy}" }
      ) {
        edges {
          node {
            title
          }
        }
      }
    }
  `;
  const variables = undefined;
  return useQuery({
    queryKey: ["envs", variables],
    queryFn: () => request(baseUrl + "/api/v2/graphql", query, undefined, headers),
  });
};
