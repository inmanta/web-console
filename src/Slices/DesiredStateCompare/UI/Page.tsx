import React, { useContext, useRef, useState } from "react";
import { Content, PageSection, Toolbar, ToolbarContent } from "@patternfly/react-core";
import { Diff, RemoteData } from "@/Core";
import { RemoteDataView, DiffWizard, EmptyView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";

export const Page: React.FC = () => {
  const { from, to } = useRouteParams<"DesiredStateCompare">();

  return <View from={from} to={to} />;
};

export const View: React.FC<Diff.Identifiers> = ({ from, to }) => {
  const { queryResolver } = useContext(DependencyContext);
  const refs: DiffWizard.Refs = useRef({});
  const [statuses, setStatuses] = useState(Diff.defaultStatuses);
  const [searchFilter, setSearchFilter] = useState("");

  const [data] = queryResolver.useOneTime<"GetDesiredStateDiff">({
    kind: "GetDesiredStateDiff",
    from,
    to,
  });

  const filteredData = RemoteData.mapSuccess(
    (resources) =>
      resources
        .filter((resource) => statuses.includes(resource.status))
        .filter((resource) =>
          resource.resource_id.toLocaleLowerCase().includes(searchFilter.toLocaleLowerCase())
        ),
    data
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
        <DiffWizard.Controls data={filteredData} refs={refs} from={from} to={to} />
      </PageSection>
      <PageSection hasBodyWrapper={false} isFilled>
        <RemoteDataView
          data={filteredData}
          label="CompareView"
          SuccessView={(resources) =>
            resources.length <= 0 ? (
              <EmptyView message={words("desiredState.compare.empty")} />
            ) : (
              <DiffWizard.ItemList
                items={resources.map(DiffWizard.fromResourceToItem)}
                refs={refs}
              />
            )
          }
        />
      </PageSection>
    </>
  );
};
