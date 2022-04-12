import React from "react";
import { ToolbarItem } from "@patternfly/react-core";
import styled from "styled-components";
import { Query, RemoteData, Resource } from "@/Core";
import { ResourceStatusBar } from "@/UI/Components";
import { DeployButton, RepairButton } from "./Components";

interface Props {
  data: RemoteData.Type<
    Query.Error<"GetResources">,
    Query.UsedData<"GetResources">
  >;
  updateFilter: (updater: (filter: Resource.Filter) => Resource.Filter) => void;
}

export const Summary: React.FC<Props> = ({ data, updateFilter }) =>
  RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => null,
      failed: () => null,
      success: (result) => (
        <>
          <StretchedToolbarItem>
            <ResourceStatusBar
              summary={result.metadata.deploy_summary}
              updateFilter={updateFilter}
            />
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
