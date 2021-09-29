import React from "react";
import { CompileDetails } from "@/Core";
import { PageSectionWithTitle } from "@/UI/Components";
import { words } from "@/UI/words";
import { CompileStageReportTable } from "./CompileStageReportTable";
import { CompileErrorsSection } from "./CompileErrorsSection";
import { StatusSection } from "./StatusSection";

interface Props {
  compileDetails: CompileDetails;
}

export const CompileDetailsSections: React.FC<Props> = ({
  compileDetails,
  ...props
}) => {
  return (
    <div {...props}>
      <PageSectionWithTitle title={words("compileDetails.status.title")}>
        <StatusSection compileDetails={compileDetails} />
      </PageSectionWithTitle>
      {compileDetails.compile_data &&
        compileDetails.compile_data.errors.length > 0 && (
          <PageSectionWithTitle title={words("compileDetails.errors.title")}>
            <CompileErrorsSection errors={compileDetails.compile_data.errors} />
          </PageSectionWithTitle>
        )}
      <PageSectionWithTitle title={words("compileDetails.stages.title")}>
        {compileDetails.reports && (
          <CompileStageReportTable
            reports={compileDetails.reports}
            compileStarted={compileDetails.started}
          />
        )}
      </PageSectionWithTitle>
    </div>
  );
};
