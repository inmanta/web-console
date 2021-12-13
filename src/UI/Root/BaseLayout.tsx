import React from "react";
import { Page } from "@patternfly/react-core";
import styled from "styled-components";
import { AppWrapper } from "./AppLayout/AppWrapper";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

export const BaseLayout: React.FC = ({ children }) => (
  <AppWrapper>
    <MainPage breadcrumb={<PageBreadcrumbs />}>{children}</MainPage>
  </AppWrapper>
);

const MainPage = styled(Page)`
  grid-area: mainpage;
  overflow: hidden;
`;
