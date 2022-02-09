import React, { useContext, useEffect, useRef } from "react";
import { Bullseye, PageSection, Spinner } from "@patternfly/react-core";
import { Maybe, RemoteData } from "@/Core";
import {
  DiffItemList,
  EmptyView,
  PagePadder,
  RemoteDataView,
} from "@/UI/Components";
import { Refs } from "@/UI/Components/DiffWizard/types";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { resourceToDiffItem } from "../DesiredStateCompare/resourceToDiffItem";
import { MaybeReport } from "./types";

interface Props {
  report: MaybeReport;
}

export const DiffPageSection: React.FC<Props> = ({ report }) =>
  Maybe.isNone(report) ? null : (
    <DiffView id={report.value.id} todo={report.value.todo as number} />
  );

const DiffView: React.FC<{ id: string; todo: number }> = ({ id, todo }) => {
  const refs: Refs = useRef({});
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

  return (
    <>
      <PageSection variant="light" hasShadowBottom sticky="top">
        controls for {id}
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
                  <DiffItemList
                    items={data.diff.map(resourceToDiffItem)}
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
