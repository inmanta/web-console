import React from "react";
import { words } from "@/Core";
import { PageContainer } from "@/UI/Components/PageContainer";
import { useRouteParams } from "@/UI/Routing";
import { CompileDetails } from "./CompileDetails";

export const Page: React.FC = () => {
  const { id } = useRouteParams<"CompileDetails">();

  return (
    <PageContainer pageTitle={words("compileDetails.title")}>
      <CompileDetails id={id} />
    </PageContainer>
  );
};
