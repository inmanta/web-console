import React, { useEffect, useState } from "react";
import {
  Content,
  Flex,
  FlexItem,
  Label,
  PageSection,
  Toolbar,
  ToolbarContent,
} from "@patternfly/react-core";
import { Diff } from "@/Core";
import { useUrlStateWithString } from "@/Data";
import { useGetDryRuns } from "@/Data/Queries";
import { DiffWizard } from "@/UI/Components";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { DryRun } from "@S/ComplianceCheck/Core/Domain";
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
 * - Allows selecting different reports, keeping the selected one in the URL so a link can open it
 * - Provides filtering by status and search text
 * - Shows error messages when data fetching fails
 *
 * @props {Props} props - The component props
 * @prop {string} version - The version to fetch dry run reports for
 *
 * @returns {React.FC<Props>} The View component that renders the compliance check interface
 */

export const View: React.FC<Props> = ({ version }) => {
  const { data, isError, error } = useGetDryRuns().useContinuous(version);
  const [statuses, setStatuses] = useState(Diff.defaultStatuses);
  const [searchFilter, setSearchFilter] = useState("");
  // An empty id selects the newest report.
  const [selectedReportId, setSelectedReportId] = useUrlStateWithString<string>({
    default: "",
    key: "report",
    route: "ComplianceCheck",
  });
  const { notifyError } = useAppAlert();

  const selectedReport: DryRun | null =
    data?.find((report) => report.id === selectedReportId) ?? data?.[0] ?? null;

  useEffect(() => {
    if (isError) {
      notifyError({
        title: words("desiredState.complianceCheck.failed"),
        message: error?.message,
      });
    }
  }, [isError, error?.message, notifyError]);

  return (
    <>
      {/* Stays in view; the report below it scrolls on its own. */}
      <PageSection hasBodyWrapper={false}>
        <Flex direction={{ default: "column" }} gap={{ default: "gapMd" }}>
          <Flex
            justifyContent={{ default: "justifyContentSpaceBetween" }}
            alignItems={{ default: "alignItemsCenter" }}
          >
            <Flex gap={{ default: "gapMd" }} alignItems={{ default: "alignItemsCenter" }}>
              {/* Wrapped, so the heading has no bottom margin and centers with the label. */}
              <FlexItem>
                <Content component="h1">{words("desiredState.complianceCheck.title")}</Content>
              </FlexItem>
              <Label variant="outline">{words("modelVersion")(Number(version))}</Label>
            </Flex>
            <TriggerDryRunAction version={version} onDryRunStarted={setSelectedReportId} />
          </Flex>
          <Flex direction={{ default: "column" }} gap={{ default: "gapXs" }}>
            {/* Wrapped for the same reason, so it sits right above the picker. */}
            <FlexItem>
              <Content component="small">
                <strong>{words("desiredState.complianceCheck.report.title")}</strong>
              </Content>
            </FlexItem>
            <Toolbar>
              <ToolbarContent style={{ padding: 0 }}>
                <SelectReportAction
                  setSelectedReport={(report) => setSelectedReportId(report?.id ?? "")}
                  selectedReport={selectedReport}
                  reportsData={data}
                />
                <DiffWizard.DiffPageFilter
                  statuses={statuses}
                  setStatuses={setStatuses}
                  searchFilter={searchFilter}
                  setSearchFilter={setSearchFilter}
                />
              </ToolbarContent>
            </Toolbar>
          </Flex>
        </Flex>
      </PageSection>
      <DiffPageSection
        report={selectedReport}
        version={version}
        statuses={statuses}
        searchFilter={searchFilter}
        onRerunStarted={setSelectedReportId}
      />
    </>
  );
};
