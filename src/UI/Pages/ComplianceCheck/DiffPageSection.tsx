import React, { useContext, useEffect, useRef } from "react";
import { PageSection } from "@patternfly/react-core";
import { Maybe, ParsedNumber, RemoteData } from "@/Core";
import {
  EmptyView,
  PagePadder,
  RemoteDataView,
  DiffWizard,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { LoadingIndicator } from "./Components";
import { MaybeReport } from "./types";

interface Props {
  report: MaybeReport;
  version: string;
}

export const DiffPageSection: React.FC<Props> = ({ report, version }) =>
  Maybe.isNone(report) ? null : (
    <DiffView
      id={report.value.id}
      todo={report.value.todo as number}
      version={version}
    />
  );

const DiffView: React.FC<{ id: string; todo: number; version: string }> = ({
  id,
  todo,
  version,
}) => {
  const refs: DiffWizard.Refs = useRef({});
  const { queryResolver } = useContext(DependencyContext);
  const [reportData, refetch] = queryResolver.useOneTime<"GetDryRunReport">({
    kind: "GetDryRunReport",
    reportId: id,
    version,
  });

  useEffect(() => {
    if (!RemoteData.isSuccess(reportData)) return;
    if (todo <= 0) return;
    refetch();
  }, [todo, id, reportData, refetch]);

  const diffData = RemoteData.mapSuccess((report) => report.diff, reportData);

  return (
    <>
      <PageSection variant="light" hasShadowBottom sticky="top">
        <DiffWizard.Controls
          data={diffData}
          refs={refs}
          from={version}
          to={"current"}
        />
      </PageSection>
      <PageSection isFilled>
        <PagePadder>
          <RemoteDataView
            data={reportData}
            SuccessView={(data) => (
              <>
                {data.summary.todo > 0 && (
                  <LoadingIndicator progress={getProgress(data.summary)} />
                )}
                {data.diff.length <= 0 ? (
                  <EmptyView message={words("desiredState.compare.empty")} />
                ) : (
                  <DiffWizard.ItemList
                    items={data.diff.map(DiffWizard.fromResourceToItem)}
                    refs={refs}
                  />
                )}
              </>
            )}
          />
        </PagePadder>
      </PageSection>
    </>
  );
};

const getProgress = (summary: {
  todo: ParsedNumber;
  total: ParsedNumber;
}): string =>
  `${Number(summary.total) - Number(summary.todo)}/${Number(summary.total)}`;
