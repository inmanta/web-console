import React from "react";
import { ToolbarItem } from "@patternfly/react-core";
import styled from "styled-components";
import { Resource } from "@/Core";
import { GetResourcesResponse } from "@/Data/Managers/V2/Resource/GetResources/useGetResources";
import { ResourceStatusBar } from "@/UI/Components";
import { DeployButton, RepairButton } from "./Components";

interface Props {
  data: GetResourcesResponse;
  updateFilter: (updater: (filter: Resource.Filter) => Resource.Filter) => void;
}

export const Summary: React.FC<Props> = ({ data, updateFilter }) => (
  <>
    <StretchedToolbarItem
      summary={data.metadata.deploy_summary}
      updateFilter={updateFilter}
    />
    <ToolbarItem>
      <DeployButton />
    </ToolbarItem>
    <ToolbarItem>
      <RepairButton />
    </ToolbarItem>
  </>
);

const StretchedToolbarItem = styled(ResourceStatusBar)`
  flex-grow: 1;
`;
