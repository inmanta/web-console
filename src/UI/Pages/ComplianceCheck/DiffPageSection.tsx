import React, { useContext, useEffect, useRef } from "react";
import { Bullseye, PageSection, Spinner } from "@patternfly/react-core";
import { Maybe, RemoteData } from "@/Core";
import {
  EmptyView,
  PagePadder,
  RemoteDataView,
  DiffWizard,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
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
                {data.summary.todo > 0 && <LoadingView />}
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

const LoadingView: React.FC = () => (
  <Bullseye style={{ paddingBottom: "24px" }}>
    <Spinner isSVG size="lg" />
  </Bullseye>
);
