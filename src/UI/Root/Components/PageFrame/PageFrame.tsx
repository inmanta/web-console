import React, { useState } from "react";
import { Page } from "@patternfly/react-core";
import { Header } from "@/UI/Root/Components/Header";
import { PageBreadcrumbs } from "@/UI/Root/Components/PageBreadcrumbs";
import { Sidebar } from "@/UI/Root/Components/Sidebar";
import { SimpleBackgroundImage } from "./SimpleBackgroundImage";

interface Props {
  environmentId?: string;
}

export const PageFrame: React.FC<Props> = ({ children, environmentId }) => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isMobileView, setIsMobileView] = React.useState(false);
  const [isNavOpenMobile, setIsNavOpenMobile] = React.useState(false);
  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };
  const onNavToggleMobile = () => {
    setIsNavOpenMobile(!isNavOpenMobile);
  };
  const onNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };

  const onToggle = isMobileView ? onNavToggleMobile : onNavToggle;

  return (
    <>
      <SimpleBackgroundImage />
      <Page
        breadcrumb={<PageBreadcrumbs />}
        onPageResize={onPageResize}
        header={
          <Header
            noEnv={!Boolean(environmentId)}
            isNavOpen={isNavOpen}
            onToggle={onToggle}
          />
        }
        sidebar={
          <Sidebar
            isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen}
            environment={environmentId}
          />
        }
      >
        {children}
      </Page>
    </>
  );
};
