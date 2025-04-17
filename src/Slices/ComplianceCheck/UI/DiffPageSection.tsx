import React, { useEffect, useRef } from "react";
import { PageSection } from "@patternfly/react-core";
import { Diff, Maybe, ParsedNumber } from "@/Core";
import { EmptyView, DiffWizard, LoadingView, ErrorView } from "@/UI/Components";
import { words } from "@/UI/words";
import { LoadingIndicator } from "./Components";
import { MaybeReport } from "./types";
import { useGetDryRunReport } from "@/Data/Managers/V2/DryRun/GetDryRunReport/useGetDryRunReport";

interface Props {
  report: MaybeReport;
  version: string;
  statuses: Diff.Status[];
  searchFilter: string;
}

export const DiffPageSection: React.FC<Props> = ({ report, version, statuses, searchFilter }) =>
  Maybe.isNone(report) ? null : (
    <DiffView
      id={report.value.id}
      todo={report.value.todo as number}
      version={version}
      statuses={statuses}
      searchFilter={searchFilter}
    />
  );

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
  }, [todo, isLoading]);

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

const getProgress = (summary: { todo: ParsedNumber; total: ParsedNumber }): string =>
  `${Number(summary.total) - Number(summary.todo)}/${Number(summary.total)}`;
