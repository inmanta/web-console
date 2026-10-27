import React, { useRef, useState } from "react";
import { Content, PageSection, Toolbar, ToolbarContent } from "@patternfly/react-core";
import * as DiffWizard from "@/UI/Components/DiffWizard";
import { Diff, words } from "@inmanta/web-console-core";
import { useGetDesiredStateDiff } from "@inmanta/web-console-core/Queries/Slices/DesiredState";
import { useRouteParams } from "@inmanta/web-console-core/Routing";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";

export const Page: React.FC = () => {
  const { from, to } = useRouteParams<"DesiredStateCompare">();

  return <View from={from} to={to} />;
};

export const View: React.FC<Diff.Identifiers> = ({ from, to }) => {
  const refs: DiffWizard.Refs = useRef({});
  const [statuses, setStatuses] = useState(Diff.defaultStatuses);
  const [searchFilter, setSearchFilter] = useState("");

  const { data, isError, error, isSuccess, refetch } = useGetDesiredStateDiff().useOneTime(
    from,
    to
  );

  if (isError) {
    return <ErrorView ariaLabel="CompareView-Error" retry={refetch} message={error.message} />;
  }

  if (isSuccess) {
    const filteredResources = data
      .filter((resource) => statuses.includes(resource.status))
      .filter((resource) =>
        resource.resource_id.toLocaleLowerCase().includes(searchFilter.toLocaleLowerCase())
      );

    return (
      <>
        <PageSection>
          <Content>
            <Content component="h1">{words("desiredState.compare.title")}</Content>
          </Content>
        </PageSection>
        <PageSection hasBodyWrapper={false}>
          <Toolbar>
            <ToolbarContent style={{ padding: 0 }}>
              <DiffWizard.DiffPageFilter
                statuses={statuses}
                setStatuses={setStatuses}
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
              />
            </ToolbarContent>
          </Toolbar>
        </PageSection>
        <PageSection hasBodyWrapper={false} hasShadowBottom>
          <DiffWizard.Controls
            data={filteredResources}
            refs={refs}
            fromLabel={words("modelVersion")(from)}
            toLabel={words("modelVersion")(to)}
          />
        </PageSection>
        <PageSection hasBodyWrapper={false} isFilled>
          {data.length <= 0 ? (
            <EmptyView
              message={words("desiredState.compare.empty")}
              aria-label="CompareView-Empty"
            />
          ) : (
            <DiffWizard.ItemList
              items={filteredResources.map(DiffWizard.fromResourceToItem)}
              refs={refs}
            />
          )}
        </PageSection>
      </>
    );
  }

  return <LoadingView ariaLabel="CompareView-Loading" />;
};
