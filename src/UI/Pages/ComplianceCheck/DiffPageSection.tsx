import React, { useContext, useRef } from "react";
import { PageSection } from "@patternfly/react-core";
import { RemoteData } from "@/Core";
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
import { RemoteReportId } from "./types";

interface Props {
  reportId: RemoteReportId;
}

export const DiffPageSection: React.FC<Props> = ({ reportId }) =>
  RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingDiffPageSection />,
      failed: () => <LoadingDiffPageSection />,
      success: (id) => <SuccessDiffPageSection reportId={id} />,
    },
    reportId
  );

const LoadingDiffPageSection: React.FC = () => (
  <>
    <PageSection variant="light" hasShadowBottom sticky="top">
      loading
    </PageSection>
    <PageSection isFilled>
      <PagePadder>loading</PagePadder>
    </PageSection>
  </>
);

const SuccessDiffPageSection: React.FC<{ reportId: string }> = ({
  reportId,
}) => {
  const refs: Refs = useRef({});
  const { queryResolver } = useContext(DependencyContext);
  const [reportData] = queryResolver.useOneTime<"GetDryRunReport">({
    kind: "GetDryRunReport",
    reportId,
  });

  const resourcesData = RemoteData.mapSuccess(
    (report) => report.diff,
    reportData
  );

  return (
    <>
      <PageSection variant="light" hasShadowBottom sticky="top">
        controls for {reportId}
      </PageSection>
      <PageSection isFilled>
        <PagePadder>
          <RemoteDataView
            data={resourcesData}
            SuccessView={(resources) =>
              resources.length <= 0 ? (
                <EmptyView message={words("desiredState.compare.empty")} />
              ) : (
                <DiffItemList
                  items={resources.map(resourceToDiffItem)}
                  refs={refs}
                />
              )
            }
          />
        </PagePadder>
      </PageSection>
    </>
  );
};
