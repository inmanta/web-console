import React, { useContext, useEffect, useRef, useState } from "react";
import { Content, PageSection, Toolbar, ToolbarContent } from "@patternfly/react-core";
import { Diff, Maybe, RemoteData } from "@/Core";
import { DiffWizard, ToastAlert } from "@/UI/Components";
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
  const [selectedReport, setSelectedReport] = useState<MaybeReport>(Maybe.none());
  const [searchFilter, setSearchFilter] = useState("");
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
   * Setting the selected report when data changed and there is no selected report
   * Update the selected report when chosen one has new data available
   */
  useEffect(() => {
    if (!RemoteData.isSuccess(data) || data.value.length <= 0) return;

    if (Maybe.isSome(selectedReport)) {
      const fetchedSelectedReport = data.value.find(
        (report) => report.id === selectedReport.value.id
      );

      if (!!fetchedSelectedReport && fetchedSelectedReport.todo !== selectedReport.value.todo) {
        setSelectedReport(Maybe.some(fetchedSelectedReport));
      } else {
        return;
      }
    } else {
      setSelectedReport(Maybe.some(data.value[0]));
    }
  }, [selectedReport, data]);

  useEffect(() => {
    if (!updatedList) return;

    if (RemoteData.isSuccess(data)) {
      setSelectedReport(firstReport.current);
    }

    setUpdatedList(false);
  }, [updatedList, data]);

  return (
    <>
      <ToastAlert
        data-testid="ToastAlert"
        title={words("desiredState.complianceCheck.failed")}
        message={errorMessage}
        setMessage={setErrorMessage}
      />
      <PageSection>
        <Content>
          <Content component="h1">{words("desiredState.complianceCheck.title")}</Content>
        </Content>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <Toolbar>
          <ToolbarContent style={{ padding: 0 }}>
            <SelectReportAction
              setSelectedReport={setSelectedReport}
              selectedReport={selectedReport}
              reportsData={data}
            />
            <DiffWizard.DiffPageFilter
              statuses={statuses}
              setStatuses={setStatuses}
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
            />
            <TriggerDryRunAction version={version} />
          </ToolbarContent>
        </Toolbar>
      </PageSection>
      <DiffPageSection
        report={selectedReport}
        version={version}
        statuses={statuses}
        searchFilter={searchFilter}
      />
    </>
  );
};
