import React from "react";
import { words } from "@inmanta/web-console-core";
import { CompileDetails } from "@inmanta/web-console-core/Domain/CompileDetails";
import { PageSectionWithTitle } from "@inmanta/web-console-feature-orchestration-engine/Components/PageSectionWithTitle";
import { CompileErrorsSection } from "./CompileErrorsSection";
import { CompileStageReportTable } from "./CompileStageReportTable";
import { StatusSection } from "./StatusSection";

interface Props {
  compileDetails: CompileDetails;
}

export const CompileDetailsSections: React.FC<Props> = ({ compileDetails, ...props }) => {
  return (
    <div {...props}>
      <PageSectionWithTitle title={words("status")}>
        <StatusSection compileDetails={compileDetails} />
      </PageSectionWithTitle>
      {compileDetails.compile_data && compileDetails.compile_data.errors.length > 0 && (
        <PageSectionWithTitle title={words("compileDetails.errors.title")}>
          <CompileErrorsSection errors={compileDetails.compile_data.errors} />
        </PageSectionWithTitle>
      )}
      <PageSectionWithTitle title={words("compileDetails.stages.title")}>
        {compileDetails.reports && <CompileStageReportTable reports={compileDetails.reports} />}
      </PageSectionWithTitle>
    </div>
  );
};
