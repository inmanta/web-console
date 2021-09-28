import React from "react";
import { CompileDetails } from "@/Core";
import { PageSectionWithTitle } from "@/UI/Components";
import { words } from "@/UI/words";
import { CompileStageReportTable } from "./CompileStageReportTable";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";

interface Props {
  compileDetails: CompileDetails;
}

export const CompileDetailsSections: React.FC<Props> = ({
  compileDetails,
  ...props
}) => {
  return (
    <div {...props}>
      <PageSectionWithTitle title={words("compileDetails.info.title")}>
        TODO
      </PageSectionWithTitle>
      {compileDetails.compile_data &&
        compileDetails.compile_data.errors.length > 0 && (
          <PageSectionWithTitle title={words("compileDetails.errors.title")}>
            <DescriptionList isHorizontal>
              {compileDetails.compile_data.errors.map((compileError, idx) => {
                return (
                  <>
                    <DescriptionListGroup key={`type-${idx}`}>
                      <DescriptionListTerm key={`type-${idx}`}>
                        type
                      </DescriptionListTerm>
                      <DescriptionListDescription>
                        {" "}
                        {compileError.type}
                      </DescriptionListDescription>
                    </DescriptionListGroup>

                    <DescriptionListGroup key={`message-${idx}`}>
                      <DescriptionListTerm key={`message-${idx}`}>
                        message
                      </DescriptionListTerm>
                      <DescriptionListDescription>
                        {" "}
                        {compileError.message}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </>
                );
              })}
            </DescriptionList>
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
