import React, { useEffect, useRef, useState } from "react";
import { Content, PageSection, Toolbar, ToolbarContent } from "@patternfly/react-core";
import { Diff } from "@/Core";
import { DryRun, useGetDryRuns } from "@/Data/Managers/V2/DryRun";
import { DiffWizard, ToastAlert } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { SelectReportAction, TriggerDryRunAction } from "./Components";
import { DiffPageSection } from "./DiffPageSection";

export const Page: React.FC = () => {
  const { version } = useRouteParams<"ComplianceCheck">();

  return <View version={version} />;
};

interface Props {
  version: string;
}

export const View: React.FC<Props> = ({ version }) => {
  const { data, isSuccess, isError, error } = useGetDryRuns().useContinuous(version);
  const [errorMessage, setErrorMessage] = useState("");
  const [statuses, setStatuses] = useState(Diff.defaultStatuses);
  const [selectedReport, setSelectedReport] = useState<DryRun | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const firstReport = useRef<DryRun | null>(null);

  /**
   * Setting the errorMessage when data failed
   */
  useEffect(() => {
    if (isError) {
      setErrorMessage(error.message);
    }
  }, [isError, error?.message]);

  /**
   * Setting the firstReport mutable ref when data changes
   */
  useEffect(() => {
    if (isSuccess) {
      if (data.length <= 0) {
        firstReport.current = null;
      }

      firstReport.current = data[0];
    } else {
      firstReport.current = null;
    }
  }, [data, isSuccess]);

  /**
   * Setting the selected report when data changed and there is no selected report
   * Update the selected report when chosen one has new data available
   */
  useEffect(() => {
    if (!isSuccess || data.length <= 0) return;

    if (selectedReport) {
      const fetchedSelectedReport = data.find((report) => report.id === selectedReport.id);
      if (!!fetchedSelectedReport && fetchedSelectedReport.todo !== selectedReport.todo) {
        setSelectedReport(fetchedSelectedReport);
      } else {
        return;
      }
    } else {
      setSelectedReport(data[0]);
    }
  }, [selectedReport, data, isSuccess]);
  useEffect(() => {
    if (isSuccess) {
      setSelectedReport(firstReport.current);
    }
  }, [isSuccess, data]);

  return (
    <>
      <ToastAlert
        data-testid="ToastAlert"
        title={words("desiredState.complianceCheck.failed")}
        message={errorMessage}
        setMessage={setErrorMessage}
      />
      <PageSection>
        <Content>
          <Content component="h1">{words("desiredState.complianceCheck.title")}</Content>
        </Content>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <Toolbar>
          <ToolbarContent style={{ padding: 0 }}>
            <SelectReportAction
              setSelectedReport={setSelectedReport}
              selectedReport={selectedReport}
              reportsData={data}
            />
            <DiffWizard.DiffPageFilter
              statuses={statuses}
              setStatuses={setStatuses}
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
            />
            <TriggerDryRunAction version={version} />
          </ToolbarContent>
        </Toolbar>
      </PageSection>
      <DiffPageSection
        report={selectedReport}
        version={version}
        statuses={statuses}
        searchFilter={searchFilter}
      />
    </>
  );
};
