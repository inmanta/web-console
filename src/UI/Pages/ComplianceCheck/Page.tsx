import React, { useContext } from "react";
import { PageSection } from "@patternfly/react-core";
import styled from "styled-components";
import { PageTitle, PagePadder } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";

export const Page: React.FC = () => {
  const { version } = useRouteParams<"ComplianceCheck">();
  return <View version={version} />;
};

interface Props {
  version: string;
}

export const View: React.FC<Props> = ({ version }) => {
  const { queryResolver } = useContext(DependencyContext);
  // Continuous, GET list of dryruns
  const [data] = queryResolver.useContinuous<"GetDryRuns">({
    kind: "GetDryRuns",
    version: parseInt(version),
  });

  console.log({ data });
  // on success => select 1st

  // useEffect, refresh refs when different diff

  return (
    <>
      <StyledPageSection variant="light">
        <PageTitle>{words("desiredState.complianceCheck.title")}</PageTitle>
      </StyledPageSection>
      <PageSection variant="light">dryrun actions and list</PageSection>
      <PageSection variant="light" hasShadowBottom sticky="top">
        jump to resource dropdown + title {version}
      </PageSection>
      <PageSection isFilled>
        <PagePadder>RemoteDataView with diffed resources</PagePadder>
      </PageSection>
    </>
  );
};

const StyledPageSection = styled(PageSection)`
  padding-bottom: 0;
`;
