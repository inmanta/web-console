import React from "react";
import { PageSectionWithTitle } from "@/UI/Components";
import { words } from "@/UI/words";
import { CompileDetails } from "./CompileDetails";
import { useRouteParams } from "@/UI/Routing";

export const Page: React.FC = () => {
  const { id } = useRouteParams<"CompileDetails">();

  return (
    <PageSectionWithTitle title={words("compileDetails.title")}>
      <CompileDetails id={id} />
    </PageSectionWithTitle>
  );
};
