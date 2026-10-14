import React, { useEffect, useMemo, useState } from "react";
import {
  Content,
  Flex,
  FlexItem,
  Label,
  PageSection,
  Title,
  Toolbar,
  ToolbarContent,
} from "@patternfly/react-core";
import { Diff } from "@/Core";
import { useUrlStateWithString } from "@/Data/Common";
import { useGetDryRuns } from "@/Data/Queries/Slices/DryRun";
import { useGetInstancesById } from "@/Data/Queries/Slices/ServiceInstance";
import * as DiffWizard from "@/UI/Components/DiffWizard";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { DryRun } from "@S/ComplianceCheck/Core/Domain";
import { SelectReportAction, TriggerDryRunAction } from "./Components";
import { getInstanceIdLookup } from "./Components/ReportScope/helpers";
import { DiffPageSection } from "./DiffPageSection";
import { REPORT_URL_STATE_KEY } from "./reportSearch";

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
    key: REPORT_URL_STATE_KEY,
    route: "ComplianceCheck",
  });
  // A new dry run becomes the newest report once the list refreshes. Selecting it when it starts,
  // rather than once the server answers, keeps a late answer from navigating back to this page.
  const selectNewestReport = () => setSelectedReportId("");
  const { notifyError } = useAppAlert();

  // An id that isn't in the list (a deleted report, or a stale link) also shows the newest report,
  // and the picker shows which one that is.
  const selectedReport: DryRun | null =
    data?.find((report) => report.id === selectedReportId) ?? data?.[0] ?? null;

  // The instances of all reports are looked up together, for the picker and the scope card alike:
  // one request per service entity, and one per instance whose filter names no entity.
  const instanceIdLookup = useMemo(() => getInstanceIdLookup(data ?? []), [data]);
  const instances = useGetInstancesById(instanceIdLookup);

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
              <Label variant="outline">{words("modelVersion")(version)}</Label>
            </Flex>
            <TriggerDryRunAction version={version} onDryRunStart={selectNewestReport} />
          </Flex>
          <Flex direction={{ default: "column" }} gap={{ default: "gapXs" }}>
            <Title headingLevel="h2" size="md">
              {words("desiredState.complianceCheck.report.title")}
            </Title>
            <Toolbar>
              <ToolbarContent style={{ padding: 0 }}>
                <SelectReportAction
                  setSelectedReport={(report) => setSelectedReportId(report?.id ?? "")}
                  selectedReport={selectedReport}
                  reportsData={data}
                  instances={instances}
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
        instances={instances}
        onRerunStart={selectNewestReport}
      />
    </>
  );
};
