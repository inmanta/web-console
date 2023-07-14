import React, { useContext, useRef, useState } from "react";
import { PageSection, Toolbar, ToolbarContent } from "@patternfly/react-core";
import styled from "styled-components";
import { Diff, RemoteData } from "@/Core";
import {
  RemoteDataView,
  PageTitle,
  DiffWizard,
  PagePadder,
  EmptyView,
} from "@/UI/Components";
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

  const [data] = queryResolver.useOneTime<"GetDesiredStateDiff">({
    kind: "GetDesiredStateDiff",
    from,
    to,
  });

  const filteredData = RemoteData.mapSuccess(
    (resources) =>
      resources.filter((resource) => statuses.includes(resource.status)),
    data
  );

  return (
    <>
      <StyledPageSection variant="light">
        <PageTitle>{words("desiredState.compare.title")}</PageTitle>
      </StyledPageSection>
      <PageSection variant="light">
        <ToolBarContainer>
          <ToolbarContent style={{ padding: 0 }}>
            <DiffWizard.StatusFilter
              statuses={statuses}
              setStatuses={setStatuses}
            />
          </ToolbarContent>
        </ToolBarContainer>
      </PageSection>
      <PageSection variant="light" hasShadowBottom sticky="top">
        <DiffWizard.Controls
          data={filteredData}
          refs={refs}
          from={from}
          to={to}
        />
      </PageSection>
      <PageSection isFilled>
        <PagePadder>
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
        </PagePadder>
      </PageSection>
    </>
  );
};

const StyledPageSection = styled(PageSection)`
  padding-bottom: 0;
`;

const ToolBarContainer = styled(Toolbar)`
  z-index: var(--pf-global--ZIndex--xl);
`;
