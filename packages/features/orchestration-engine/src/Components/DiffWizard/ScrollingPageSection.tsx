import React from "react";
import { PageSection } from "@patternfly/react-core";

/**
 * The page section of a diff page that holds the diff: it takes the rest of the page and scrolls
 * on its own, so the page header above it stays in view. It has no top padding, since the section
 * above already ends in padding.
 *
 * @props {React.PropsWithChildren} props - The component props
 *  @prop {React.ReactNode} children - The content of the section
 *
 * @returns {React.FC<React.PropsWithChildren>} The page section
 */
export const ScrollingPageSection: React.FC<React.PropsWithChildren> = ({ children }) => (
  <PageSection
    hasBodyWrapper={false}
    isFilled
    style={{ flex: "1 1 auto", minHeight: 0, overflow: "auto", paddingTop: 0 }}
  >
    {children}
  </PageSection>
);
