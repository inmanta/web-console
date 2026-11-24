import React, { useEffect } from "react";
import { Stack, StackItem } from "@patternfly/react-core";
import { DryRun, words } from "@inmanta/web-console-core";
import { useGetDryRunReport } from "@inmanta/web-console-core/Queries/Slices/DryRun";
import * as DiffWizard from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { ReportScope } from "./Components";

/** Keeps the diff usable below a tall expanded scope; the section scrolls down to it. */
const DIFF_MIN_HEIGHT_BELOW_SCOPE = "50vh";

interface Props {
  report: DryRun | null;
  version: string;
}

/**
 * DiffPageSection component displays the compliance check diff results
 * Shows a loading view when data is being fetched, error view on failure,
 * and the diff wizard with filtered resources when data is available
 * @props {Props} props - The component props
 * @prop {DryRun | null} report - The dry run report data
 * @prop {string} version - The version of the dry run
 *
 * @returns {React.FC<Props>} The DiffPageSection component
 */
export const DiffPageSection: React.FC<Props> = ({ report, ...props }) =>
  report ? <DiffView report={report} {...props} /> : null;

/**
 * DiffView component displays the compliance check diff results
 * Shows the scope of the report on top, which stays in place while switching reports, and below it
 * a loading view when data is being fetched, error view on failure,
 * and the diff wizard with filtered resources when data is available. It scrolls on its own.
 * @props {Props} props - The component props
 * @prop {DryRun} report - The dry run report
 * @prop {string} version - The version of the dry run
 *
 * @returns {React.FC<Props>} The DiffView component
 */
const DiffView: React.FC<Omit<Props, "report"> & { report: DryRun }> = ({ report, version }) => {
  const todo = Number(report.todo);
  const { data, isSuccess, isError, isLoading, error, refetch } = useGetDryRunReport().useOneTime(
    version,
    report.id
  );

  useEffect(() => {
    // keep the refetching until there are still resources to check
    if (todo <= 0 && isLoading) {
      return;
    }
    refetch();
  }, [todo, isLoading, refetch]);

  const renderDiff = () => {
    if (isError) {
      return (
        <ErrorView message={error.message} retry={refetch} ariaLabel="DiffPageSection-Error" />
      );
    }

    if (!isSuccess) {
      return <LoadingView ariaLabel="DiffPageSection-Loading" />;
    }

    if (data.diff.length <= 0) {
      return <EmptyView message={words("desiredState.compare.empty")} />;
    }

    return (
      <DiffWizard.FilteredResourceListWithDiffPane
        resources={data.diff}
        route="ComplianceCheck"
        fromLabel={words("currentState")}
        toLabel={words("modelVersion")(version)}
      />
    );
  };

  return (
    <DiffWizard.ScrollingPageSection>
      <Stack hasGutter>
        {/* The scope comes from the report itself, so it stays in place while the diff loads. */}
        <StackItem>
          <ReportScope report={report} diff={data?.diff} />
        </StackItem>
        <StackItem isFilled style={{ minHeight: DIFF_MIN_HEIGHT_BELOW_SCOPE }}>
          {renderDiff()}
        </StackItem>
      </Stack>
    </DiffWizard.ScrollingPageSection>
  );
};
