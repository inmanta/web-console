import React from "react";
import { Query, RemoteData } from "@/Core";
import { DeployStateChart } from "./DeployStateChart";

interface Props {
  data: RemoteData.Type<
    Query.Error<"GetResources">,
    Query.UsedData<"GetResources">
  >;
}

export const Summary: React.FC<Props> = ({ data }) =>
  RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => null,
      failed: () => null,
      success: (result) => (
        <DeployStateChart summary={result.metadata.deploy_summary} />
      ),
    },
    data
  );
