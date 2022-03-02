import React from "react";
import { Tr, Td } from "@patternfly/react-table";
import { Resource } from "@/Core";
import { ResourceLink } from "@/UI/Components/ResourceLink";
import { ResourceStatusLabel } from "@/UI/Components/ResourceStatus";
import { RequiresTableWrapper } from "./RequiresTableWrapper";

interface Props {
  requiresStatus: Record<string, Resource.Status>;
  "aria-label"?: string;
}

export const RequiresTable: React.FC<Props> = ({
  requiresStatus,
  ...props
}) => (
  <RequiresTableWrapper {...props}>
    {Object.entries(requiresStatus).map(([resource_id, status], idx) => (
      <Tr key={idx}>
        <Td>
          <ResourceLink resourceId={resource_id} />
        </Td>
        <Td width={15}>
          <ResourceStatusLabel status={status} />
        </Td>
      </Tr>
    ))}
  </RequiresTableWrapper>
);
