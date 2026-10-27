import React, { useEffect, useMemo, useRef } from "react";
import { Grid, PageSection } from "@patternfly/react-core";
import * as DiffWizard from "@/UI/Components/DiffWizard";
import { Diff, DryRun, words } from "@inmanta/web-console-core";
import { useGetDryRunReport } from "@inmanta/web-console-core/Queries/Slices/DryRun";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { DryRunProgressLabel, ReportScope } from "./Components";

interface Props {
  report: DryRun | null;
  version: string;
  statuses: Diff.Status[];
  searchFilter: string;
  onRerunStart: () => void;
}

/**
 * DiffPageSection component displays the compliance check diff results
 * Shows a loading view when data is being fetched, error view on failure,
 * and the diff wizard with filtered resources when data is available
 * @props {Props} props - The component props
 * @prop {DryRun | null} report - The dry run report data
 * @prop {string} version - The version of the dry run
 * @prop {Diff.Status[]} statuses - The statuses to filter the resources by
 * @prop {string} searchFilter - The search filter to filter the resources by
 * @prop {() => void} onRerunStart - Called when a re-run is started
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
 * @prop {Diff.Status[]} statuses - The statuses to filter the resources by
 * @prop {string} searchFilter - The search filter to filter the resources by
 * @prop {() => void} onRerunStart - Called when a re-run is started
 *
 * @returns {React.FC<Props>} The DiffView component
 */
const DiffView: React.FC<Omit<Props, "report"> & { report: DryRun }> = ({
  report,
  version,
  statuses,
  searchFilter,
  onRerunStart,
}) => {
  const refs: DiffWizard.Refs = useRef({});
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

  // Kept until the report or the filters change, so polling the report list doesn't rebuild every
  // row of a large diff.
  const diffData = useMemo(
    () => data?.diff.filter((resource) => statuses.includes(resource.status)) ?? [],
    [data, statuses]
  );
  const items = useMemo(
    () =>
      diffData
        .filter((resource) =>
          resource.resource_id.toLocaleLowerCase().includes(searchFilter.toLocaleLowerCase())
        )
        .map(DiffWizard.fromResourceToItem),
    [diffData, searchFilter]
  );

  const renderDiff = () => {
    if (isError) {
      return (
        <ErrorView message={error.message} retry={refetch} ariaLabel="DiffPageSection-Error" />
      );
    }

    if (!isSuccess) {
      return <LoadingView ariaLabel="DiffPageSection-Loading" />;
    }

    return (
      <>
        <DiffWizard.Controls
          data={diffData}
          refs={refs}
          fromLabel={words("currentStateShort")}
          toLabel={words("modelVersion")(version)}
        >
          {Number(data.summary.todo) > 0 && <DryRunProgressLabel progress={data.summary} />}
        </DiffWizard.Controls>
        {data.diff.length <= 0 ? (
          <EmptyView message={words("desiredState.compare.empty")} />
        ) : (
          <DiffWizard.ItemList items={items} refs={refs} />
        )}
      </>
    );
  };

  return (
    // Scrolls on its own, so the page title, report picker and filters above it stay in view.
    // No top padding: the section above already ends in padding, which keeps the report close to
    // the filters.
    <PageSection
      hasBodyWrapper={false}
      isFilled
      style={{ flex: "1 1 auto", minHeight: 0, overflow: "auto", paddingTop: 0 }}
    >
      {/*
       * A grid rather than a flex column: a flex column squeezes the scope card, which scrolls
       * its own overflow, down to its border. It keeps its full height, so the section scrolls.
       */}
      <Grid hasGutter style={{ flexShrink: 0 }}>
        {/* The scope comes from the report itself, so it stays in place while the diff loads. */}
        <ReportScope report={report} diff={data?.diff} onRerunStart={onRerunStart} />
        {renderDiff()}
      </Grid>
    </PageSection>
  );
};
