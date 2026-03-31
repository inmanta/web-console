import React from "react";
import { Resource } from "@/Core";
import { GetResourcesResponse } from "@/Data/Queries";
import { mockCompoundResourceData } from "@/Test/Data/Resource";
import { CompoundResourceStatus } from "@/UI/Components";

interface Props {
  data: GetResourcesResponse;
  updateFilter: (updater: (filter: Resource.Filter) => Resource.Filter) => void;
}

export const Summary: React.FC<Props> = ({ updateFilter }) => (
  //TODO: Replace later on with real data
  <CompoundResourceStatus
    blocked={mockCompoundResourceData.blocked}
    compliance={mockCompoundResourceData.compliance}
    lastHandlerRun={mockCompoundResourceData.lastHandlerRun}
    totalCount={mockCompoundResourceData.totalCount}
    updateFilter={updateFilter}
  />
);
