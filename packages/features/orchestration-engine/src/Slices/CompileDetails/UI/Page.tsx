import React from "react";
import { words } from "@inmanta/web-console-core";
import { useRouteParams } from "@inmanta/web-console-core/Routing";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { CompileDetails } from "./CompileDetails";

export const Page: React.FC = () => {
  const { id } = useRouteParams<"CompileDetails">();

  return (
    <PageContainer pageTitle={words("compileDetails.title")}>
      <CompileDetails id={id} />
    </PageContainer>
  );
};
