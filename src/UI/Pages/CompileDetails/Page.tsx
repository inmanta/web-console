import React from "react";
import { useParams } from "react-router-dom";
import { PageSectionWithTitle } from "@/UI/Components";
import { Route } from "@/UI/Routing";
import { words } from "@/UI/words";
import { CompileDetails } from "./CompileDetails";

export const Page: React.FC = () => {
  const { id } = useParams<Route.Params<"CompileDetails">>();

  return (
    <PageSectionWithTitle title={words("compileDetails.title")}>
      <CompileDetails id={id} />
    </PageSectionWithTitle>
  );
};
