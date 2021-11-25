import React from "react";
import { ToolbarItem } from "@patternfly/react-core";
import { Query, RemoteData } from "@/Core";
import { DeployButton } from "./DeployButton";
import { DeployStateChart } from "./DeployStateChart";
import { RepairButton } from "./RepairButton";

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
        <>
          <ToolbarItem>
            <DeployStateChart summary={result.metadata.deploy_summary} />
          </ToolbarItem>
          <ToolbarItem>
            <DeployButton />
          </ToolbarItem>
          <ToolbarItem>
            <RepairButton />
          </ToolbarItem>
        </>
      ),
    },
    data
  );
