import React, { useContext, useEffect, useRef } from "react";
import { PageSection } from "@patternfly/react-core";
import { Diff, Maybe, ParsedNumber, RemoteData } from "@/Core";
import { EmptyView, RemoteDataView, DiffWizard } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { LoadingIndicator } from "./Components";
import { MaybeReport } from "./types";

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
  const prevId = useRef(id);
  const refs: DiffWizard.Refs = useRef({});
  const { queryResolver } = useContext(DependencyContext);
  const [reportData, refetch] = queryResolver.useOneTime<"GetDryRunReport">({
    kind: "GetDryRunReport",
    reportId: id,
    version,
  });

  useEffect(() => {
    // avoid  double refetching when id is changed
    if (prevId.current !== id) {
      prevId.current = id;

      return;
    }

    if (todo <= 0 && !RemoteData.isSuccess(reportData)) return;

    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todo, id]); //keeping refetch in the dependency creates issue with call on every update of the data, but we want to align it with the continuous call

  const diffData = RemoteData.mapSuccess(
    (report) => report.diff.filter((resource) => statuses.includes(resource.status)),
    reportData
  );

  return (
    <>
      <PageSection hasBodyWrapper={false} hasShadowBottom>
        <DiffWizard.Controls data={diffData} refs={refs} from={"current"} to={version} />
      </PageSection>
      <PageSection hasBodyWrapper={false} isFilled>
        <RemoteDataView
          data={reportData}
          SuccessView={(data) => (
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
          )}
        />
      </PageSection>
    </>
  );
};

const getProgress = (summary: { todo: ParsedNumber; total: ParsedNumber }): string =>
  `${Number(summary.total) - Number(summary.todo)}/${Number(summary.total)}`;
