import React, { useEffect, useRef, useState } from "react";
import { Content, PageSection, Toolbar, ToolbarContent } from "@patternfly/react-core";
import { Diff } from "@/Core";
import { DryRun, useGetDryRuns } from "@/Data/Queries";
import { DiffWizard, ToastAlert } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { SelectReportAction, TriggerDryRunAction } from "./Components";
import { DiffPageSection } from "./DiffPageSection";

/**
 * ComplianceCheck Page component
 *
 * This component serves as the main entry point for the Compliance Check feature.
 * It extracts the version parameter from the route and passes it to the View component.
 *
 * @returns {React.FC} The Page component that renders the compliance check view
 */

export const Page: React.FC = () => {
  const { version } = useRouteParams<"ComplianceCheck">();

  return <View version={version} />;
};

interface Props {
  version: string;
}

/**
 * View component for the Compliance Check page
 *
 * This component handles the main functionality of the Compliance Check feature:
 * - Fetches and displays dry run reports for the specified version
 * - Allows selecting different reports
 * - Provides filtering by status and search text
 * - Shows error messages when data fetching fails
 *
 * @props {Props} props - The component props
 * @prop {string} version - The version to fetch dry run reports for
 *
 * @returns {React.FC<Props>} The View component that renders the compliance check interface
 */

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
