import React from "react";
import { RequiresTable } from "@/UI/Components/RequiresTable";
import { words } from "@inmanta/web-console-core";
import { Details } from "@inmanta/web-console-core/Domain/Resource/Resource";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";

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
    <RequiresTable aria-label="ResourceRequires-Success" requiresStatus={details.requires_status} />
  );
};
