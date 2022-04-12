import React from "react";
import styled from "styled-components";
import { Description, PageContainer } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { DetailsProvider } from "./DetailsProvider";

export const Page: React.FC = () => {
  const { version, resourceId } =
    useRouteParams<"DesiredStateResourceDetails">();

  return (
    <PageContainer title={words("desiredState.resourceDetails.title")}>
      <StyledDescription>{resourceId}</StyledDescription>
      <DetailsProvider version={version} resourceId={resourceId} />
    </PageContainer>
  );
};

const StyledDescription = styled(Description)`
  margin-bottom: 16px;
`;
