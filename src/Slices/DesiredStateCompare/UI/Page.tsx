import React, { useRef, useState } from "react";
import { Content, PageSection, Toolbar, ToolbarContent } from "@patternfly/react-core";
import { Diff, RemoteData } from "@/Core";
import { useGetDesiredStateDiff } from "@/Data/Managers/V2/DesiredState";
import { DiffWizard, EmptyView, LoadingView, ErrorView } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";

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
          {/* RemoteData will throw type error after Dry run query updates will take place, for now this component will stay as is*/}
          <DiffWizard.Controls
            data={RemoteData.success(filteredResources)}
            refs={refs}
            from={from}
            to={to}
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
