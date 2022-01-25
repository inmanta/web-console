import React from "react";
import styled from "styled-components";
import { Description, PageContainer } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { ResourceDetailsView } from "./ResourceDetailsView";

export const Page: React.FC = () => {
  const { resourceId } = useRouteParams<"ResourceDetails">();
  return (
    <PageContainer title={words("resources.details.title")}>
      <StyledDescription>{resourceId}</StyledDescription>
      <ResourceDetailsView resourceId={resourceId} />
    </PageContainer>
  );
};

const StyledDescription = styled(Description)`
  margin-bottom: 16px;
`;
