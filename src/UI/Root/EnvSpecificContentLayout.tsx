import React, { useContext } from "react";
import { Page, PageSidebar } from "@patternfly/react-core";
import { ErrorView } from "@/UI/Components/ErrorView";
import { DependencyResolver, DependencyContext } from "@/UI/Dependency";
import { AppWrapper } from "@/UI/Root/AppLayout/AppWrapper";
import { Sidebar } from "@/UI/Root/AppLayout/Sidebar";
import { words } from "@/UI/words";
import { PageBreadcrumbs } from "./PageBreadcrumbs";

export const EnvSpecificContentLayout: React.FC = ({ children }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useSelected();
  const [isNavOpen, setIsNavOpen] = React.useState(true);
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
    <AppWrapper isNavOpen={isNavOpen} onToggle={onToggle} withEnv>
      {!environment ? (
        <ErrorView message={words("error.environment.missing")} />
      ) : (
        <>
          <DependencyResolver environment={environment.id} />
          <Page
            breadcrumb={<PageBreadcrumbs />}
            onPageResize={onPageResize}
            sidebar={
              <PageSidebar
                aria-label="PageSidebar"
                nav={<Sidebar environment={environment.id} />}
                isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen}
                theme="dark"
              />
            }
            style={{ gridArea: "mainpage", overflow: "hidden" }}
          >
            {children}
          </Page>
        </>
      )}
    </AppWrapper>
  );
};
