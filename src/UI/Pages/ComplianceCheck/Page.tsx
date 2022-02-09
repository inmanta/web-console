import React, { useContext, useEffect, useState } from "react";
import { PageSection } from "@patternfly/react-core";
import styled from "styled-components";
import { RemoteData } from "@/Core";
import { PageTitle } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { DryRunActions } from "./Components";
import { DiffPageSection } from "./DiffPageSection";

export const Page: React.FC = () => {
  const { version } = useRouteParams<"ComplianceCheck">();
  return <View version={version} />;
};

interface Props {
  version: string;
}

export const View: React.FC<Props> = ({ version }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [dryRunListData, refetch] = queryResolver.useContinuous<"GetDryRuns">({
    kind: "GetDryRuns",
    version: parseInt(version),
  });
  const [reportId, setReportId] = useState<
    RemoteData.RemoteData<never, string>
  >(RemoteData.notAsked());

  useEffect(() => {
    if (!RemoteData.isNotAsked(reportId)) return;
    if (!RemoteData.isSuccess(dryRunListData)) return;
    setForcedReportId(dryRunListData.value[0].id);
  }, [reportId, dryRunListData]);

  const setForcedReportId = (id: string) => setReportId(RemoteData.success(id));

  const updateList = async () => {
    await refetch();
    setReportId;
  };

  return (
    <>
      <StyledPageSection variant="light">
        <PageTitle>{words("desiredState.complianceCheck.title")}</PageTitle>
      </StyledPageSection>
      <PageSection variant="light">
        <DryRunActions
          version={version}
          updateList={updateList}
          setReportId={setForcedReportId}
          reportId={reportId}
          reportsData={dryRunListData}
        />
      </PageSection>
      <DiffPageSection reportId={reportId} />
    </>
  );
};

const StyledPageSection = styled(PageSection)`
  padding-bottom: 0;
`;
