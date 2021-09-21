import { PageSectionWithTitle } from "@/UI/Components";
import { words } from "@/UI/words";

import React from "react";

export const CompileReports: React.FC = () => {
  return (
    <PageSectionWithTitle
      title={words("compileReports.title")}
    ></PageSectionWithTitle>
  );
};
