import React from "react";
import { PageContainer } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";

export const Page: React.FC = () => {
  const { sourceVersion, targetVersion } =
    useRouteParams<"DesiredStateCompare">();

  return (
    <PageContainer title={words("desiredState.compare.title")}>
      <p>{sourceVersion}</p>
      <p>{targetVersion}</p>
    </PageContainer>
  );
};
