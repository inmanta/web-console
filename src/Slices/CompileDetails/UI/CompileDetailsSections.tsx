import React from "react";
import { PageSectionWithTitle } from "@/UI/Components";
import { words } from "@/UI/words";
import { CompileDetails } from "@S/CompileDetails/Core/Domain";
import { CompileErrorsSection } from "./CompileErrorsSection";
import { CompileStageReportTable } from "./CompileStageReportTable";
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
