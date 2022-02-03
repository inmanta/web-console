import React, { useContext, useRef } from "react";
import { PageSection } from "@patternfly/react-core";
import styled from "styled-components";
import { Diff } from "@/Core";
import {
  RemoteDataView,
  PageTitle,
  DiffItemList,
  PagePadder,
  EmptyView,
} from "@/UI/Components";
import { Refs } from "@/UI/Components/DiffWizard/types";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Controls } from "./Controls";
import { resourceToDiffItem } from "./resourceToDiffItem";

export const Page: React.FC = () => {
  const { from, to } = useRouteParams<"DesiredStateCompare">();
  return <View from={from} to={to} />;
};

export const View: React.FC<Diff.Identifiers> = ({ from, to }) => {
  const { queryResolver } = useContext(DependencyContext);
  const refs: Refs = useRef({});

  const [data] = queryResolver.useOneTime<"GetDesiredStateDiff">({
    kind: "GetDesiredStateDiff",
    from,
    to,
  });

  return (
    <>
      <StyledPageSection variant="light">
        <PageTitle>{words("desiredState.compare.title")}</PageTitle>
      </StyledPageSection>
      <PageSection variant="light" hasShadowBottom sticky="top">
        <Controls data={data} refs={refs} from={from} to={to} />
      </PageSection>
      <PageSection isFilled>
        <PagePadder>
          <RemoteDataView
            data={data}
            label="CompareView"
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

const StyledPageSection = styled(PageSection)`
  padding-bottom: 0;
`;
