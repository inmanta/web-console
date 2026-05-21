import React from "react";
import { Details } from "@/Core/Domain/Resource/Resource";
import { EmptyView } from "@/UI/Components";
import { words } from "@/UI/words";
import { extractReferences } from "@S/ResourceDetails/Core/Reference";
import { ReferencesTable } from "./ReferencesTable";

interface Props {
  details: Details;
}

/**
 * Lists the `references` carried on the resource's desired state. Each row is
 * expandable; the expanded view shows the reference's arguments using the same
 * key/value layout as the Desired State tab.
 */
export const ReferencesTab: React.FC<Props> = ({ details }) => {
  const references = extractReferences(details.attributes);

  if (references.length === 0) {
    return (
      <EmptyView
        message={words("resources.references.empty")}
        aria-label="ReferencesTab-Empty"
      />
    );
  }

  return <ReferencesTable references={references} />;
};
