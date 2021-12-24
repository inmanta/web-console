import React from "react";
import { ToolbarItem } from "@patternfly/react-core";
import styled from "styled-components";
import { Query, RemoteData } from "@/Core";
import { DeployButton } from "./DeployButton";
import { DeployStateBar } from "./DeployStateBar";
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
          <StretchedToolbarItem>
            <DeployStateBar summary={result.metadata.deploy_summary} />
          </StretchedToolbarItem>
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

const StretchedToolbarItem = styled(ToolbarItem)`
  flex-grow: 1;
`;
