import React from "react";
import { PageSectionWithTitle } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";

export const Page: React.FC = () => {
  const { version } = useRouteParams<"DesiredStateDetails">();
  return (
    <PageSectionWithTitle title={words("desiredState.details.title")}>
      <p>version: {version}</p>
    </PageSectionWithTitle>
  );
};
