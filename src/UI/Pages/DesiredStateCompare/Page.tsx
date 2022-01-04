import React from "react";
import { PageSectionWithTitle } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";

export const Page: React.FC = () => {
  const { sourceVersion, targetVersion } =
    useRouteParams<"DesiredStateCompare">();

  return (
    <PageSectionWithTitle title={words("desiredState.compare.title")}>
      {sourceVersion} &amp; {targetVersion}
    </PageSectionWithTitle>
  );
};
