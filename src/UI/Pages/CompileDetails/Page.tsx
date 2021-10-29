import React from "react";
import { useParams } from "react-router-dom";
import { RouteParams } from "@/Core";
import { PageSectionWithTitle } from "@/UI/Components";
import { words } from "@/UI/words";
import { CompileDetails } from "./CompileDetails";

export const Page: React.FC = () => {
  const { id } = useParams<RouteParams<"CompileDetails">>();

  return (
    <PageSectionWithTitle title={words("compileDetails.title")}>
      <CompileDetails id={id} />
    </PageSectionWithTitle>
  );
};
