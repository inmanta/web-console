import React from "react";
import { PageSection } from "@patternfly/react-core";
import { RemoteData } from "@/Core";
import { PagePadder } from "@/UI/Components";
import { RemoteReportId } from "./types";

interface Props {
  reportId: RemoteReportId;
}

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

const SuccessDiffPageSection: React.FC<{ id: string }> = ({ id }) => {
  return (
    <>
      <PageSection variant="light" hasShadowBottom sticky="top">
        controls for {id}
      </PageSection>
      <PageSection isFilled>
        <PagePadder>data for {id}</PagePadder>
      </PageSection>
    </>
  );
};

export const DiffPageSection: React.FC<Props> = ({ reportId }) =>
  RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingDiffPageSection />,
      failed: () => <LoadingDiffPageSection />,
      success: (id) => <SuccessDiffPageSection id={id} />,
    },
    reportId
  );
