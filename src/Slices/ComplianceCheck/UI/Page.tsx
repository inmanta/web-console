import React, { useContext, useEffect, useRef, useState } from "react";
import { PageSection, Toolbar, ToolbarContent } from "@patternfly/react-core";
import styled from "styled-components";
import { Diff, Maybe, RemoteData } from "@/Core";
import { DiffWizard, ToastAlert, PageTitle } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { SelectReportAction, TriggerDryRunAction } from "./Components";
import { DiffPageSection } from "./DiffPageSection";
import { MaybeReport } from "./types";

export const Page: React.FC = () => {
  const { version } = useRouteParams<"ComplianceCheck">();
  return <View version={version} />;
};

interface Props {
  version: string;
}

export const View: React.FC<Props> = ({ version }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data, refetch] = queryResolver.useContinuous<"GetDryRuns">({
    kind: "GetDryRuns",
    version: parseInt(version),
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [updatedList, setUpdatedList] = useState(false);
  const [statuses, setStatuses] = useState(Diff.defaultStatuses);
  const [selectedReport, setSelectedReport] = useState<MaybeReport>(
    Maybe.none(),
  );
  const firstReport = useRef<MaybeReport>(Maybe.none());

  /**
   * Setting the errorMessage when data failed
   */
  useEffect(() => {
    if (!RemoteData.isFailed(data)) return;
    setErrorMessage(data.value);
  }, [data]);

  /**
   * Setting the firstReport mutable ref when data changes
   */
  useEffect(() => {
    if (!RemoteData.isSuccess(data) || data.value.length <= 0) {
      firstReport.current = Maybe.none();
      return;
    }

    firstReport.current = Maybe.some(data.value[0]);
  }, [data]);

  /**
   * Settings the selected report when data changed and there is no selected report
   */
  useEffect(() => {
    if (Maybe.isSome(selectedReport)) return;
    if (!RemoteData.isSuccess(data) || data.value.length <= 0) return;
    setSelectedReport(Maybe.some(data.value[0]));
  }, [selectedReport, data]);

  useEffect(() => {
    if (!updatedList) return;
    if (RemoteData.isSuccess(data)) {
      setSelectedReport(firstReport.current);
    }
    setUpdatedList(false);
  }, [updatedList, data]);

  const updateList = async () => {
    await (refetch as () => Promise<void>)();
    setUpdatedList(true);
  };

  return (
    <>
      <ToastAlert
        title={words("desiredState.complianceCheck.failed")}
        message={errorMessage}
        setMessage={setErrorMessage}
      />
      <StyledPageSection variant="light">
        <PageTitle>{words("desiredState.complianceCheck.title")}</PageTitle>
      </StyledPageSection>
      <PageSection variant="light">
        <ToolBarContainer>
          <ToolbarContent style={{ padding: 0 }}>
            <SelectReportAction
              setSelectedReport={setSelectedReport}
              selectedReport={selectedReport}
              reportsData={data}
            />
            <DiffWizard.StatusFilter
              statuses={statuses}
              setStatuses={setStatuses}
            />
            <TriggerDryRunAction version={version} updateList={updateList} />
          </ToolbarContent>
        </ToolBarContainer>
      </PageSection>
      <DiffPageSection
        report={selectedReport}
        version={version}
        statuses={statuses}
      />
    </>
  );
};

const StyledPageSection = styled(PageSection)`
  padding-bottom: 0;
`;

const ToolBarContainer = styled(Toolbar)`
  z-index: var(--pf-global--ZIndex--xl);
`;
