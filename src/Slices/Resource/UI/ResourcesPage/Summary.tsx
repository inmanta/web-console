import React from "react";
import { ToolbarItem } from "@patternfly/react-core";
import styled from "styled-components";
import { RemoteData, Resource } from "@/Core";
import { ResourceStatusBar } from "@/UI/Components";
import { ViewData } from "@S/Resource/Core/Utils";
import { DeployButton, RepairButton } from "./Components";

interface Props {
  data: ViewData;
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
          <StretchedToolbarItem
            summary={result.metadata.deploy_summary}
            updateFilter={updateFilter}
          />
          <ToolbarItem>
            <DeployButton />
          </ToolbarItem>
          <ToolbarItem>
            <RepairButton />
          </ToolbarItem>
        </>
      ),
    },
    data,
  );

const StretchedToolbarItem = styled(ResourceStatusBar)`
  flex-grow: 1;
`;
