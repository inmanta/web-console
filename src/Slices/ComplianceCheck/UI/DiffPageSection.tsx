import React, { useEffect, useRef } from "react";
import { PageSection } from "@patternfly/react-core";
import { Diff, ParsedNumber } from "@/Core";
import { DryRun, useGetDryRunReport } from "@/Data/Queries";
import { EmptyView, DiffWizard, LoadingView, ErrorView } from "@/UI/Components";
import { words } from "@/UI/words";
import { LoadingIndicator } from "./Components";

interface Props {
  report: DryRun | null;
  version: string;
  statuses: Diff.Status[];
  searchFilter: string;
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
 *
 * @returns {React.FC<Props>} The DiffPageSection component
 */
export const DiffPageSection: React.FC<Props> = ({ report, version, statuses, searchFilter }) =>
  report ? (
    <DiffView
      id={report.id}
      todo={report.todo as number}
      version={version}
      statuses={statuses}
      searchFilter={searchFilter}
    />
  ) : null;

/**
 * DiffView component displays the compliance check diff results
 * Shows a loading view when data is being fetched, error view on failure,
 * and the diff wizard with filtered resources when data is available
 * @props {Props} props - The component props
 * @prop {string} id - The id of the dry run
 * @prop {number} todo - The number of todo resources
 * @prop {string} version - The version of the dry run
 * @prop {Diff.Status[]} statuses - The statuses to filter the resources by
 * @prop {string} searchFilter - The search filter to filter the resources by
 *
 * @returns {React.FC<Props>} The DiffView component
 */
const DiffView: React.FC<{
  id: string;
  todo: number;
  version: string;
  statuses: Diff.Status[];
  searchFilter: string;
}> = ({ id, todo, version, statuses, searchFilter }) => {
  const refs: DiffWizard.Refs = useRef({});
  const { data, isSuccess, isError, isLoading, error, refetch } = useGetDryRunReport().useOneTime(
    version,
    id
  );

  useEffect(() => {
    // keep the refetching until there are still resources to check
    if (todo <= 0 && isLoading) return;
    refetch();
  }, [todo, isLoading, refetch]);

  if (isError) {
    return <ErrorView message={error.message} retry={refetch} ariaLabel="DiffPageSection-Error" />;
  }

  if (isSuccess) {
    const diffData = data.diff.filter((resource) => statuses.includes(resource.status));

    return (
      <>
        <PageSection hasBodyWrapper={false} hasShadowBottom>
          <DiffWizard.Controls data={diffData} refs={refs} from={"current"} to={version} />
        </PageSection>
        <PageSection hasBodyWrapper={false} isFilled>
          {
            <>
              {data.summary.todo > 0 && <LoadingIndicator progress={getProgress(data.summary)} />}
              {data.diff.length <= 0 ? (
                <EmptyView message={words("desiredState.compare.empty")} />
              ) : (
                <DiffWizard.ItemList
                  items={data.diff
                    .filter(
                      (resource) =>
                        statuses.includes(resource.status) &&
                        resource.resource_id
                          .toLocaleLowerCase()
                          .includes(searchFilter.toLocaleLowerCase())
                    )
                    .map(DiffWizard.fromResourceToItem)}
                  refs={refs}
                />
              )}
            </>
          }
        </PageSection>
      </>
    );
  }

  return <LoadingView ariaLabel="DiffPageSection-Loading" />;
};

/**
 * Calculates the progress based on the DryRun summary data
 *
 * @param {Object} summary - The DryRun summary containing total and todo counts
 * @param {ParsedNumber} summary.todo - The number of todo resources
 * @param {ParsedNumber} summary.total - The total number of resources
 *
 * @returns {string} The progress of completed tasks as a string in the format "completed/total"
 */
const getProgress = (summary: { todo: ParsedNumber; total: ParsedNumber }): string =>
  `${Number(summary.total) - Number(summary.todo)}/${Number(summary.total)}`;
