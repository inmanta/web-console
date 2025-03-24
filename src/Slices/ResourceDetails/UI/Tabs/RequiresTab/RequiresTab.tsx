import React from "react";
import { Details } from "@/Core/Domain/Resource/Resource";
import { EmptyView, RequiresTable } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  details: Details;
}

export const RequiresTab: React.FC<Props> = ({ details }) => {
  if (Object.keys(details.requires_status).length <= 0) {
    return (
      <EmptyView
        message={words("resources.requires.empty.message")}
        aria-label="ResourceRequires-Empty"
      />
    );
  }

  return (
    <RequiresTable
      aria-label="ResourceRequires-Success"
      requiresStatus={details.requires_status}
    />
  );
};
