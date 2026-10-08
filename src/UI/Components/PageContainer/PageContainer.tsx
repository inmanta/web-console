import React from "react";
import { Content, Flex, FlexItem, PageSection, PageSectionProps } from "@patternfly/react-core";

interface Props extends PageSectionProps {
  pageTitle: string | React.ReactNode;
  actions?: React.ReactNode;
  description?: React.ReactNode;
}

export const PageContainer: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  pageTitle,
  actions,
  description,
  style,
  ...props
}) => (
  <>
    <PageSection hasBodyWrapper={false}>
      <Content>
        {actions ? (
          <Flex
            alignItems={{ default: description ? "alignItemsFlexStart" : "alignItemsCenter" }}
            justifyContent={{ default: "justifyContentSpaceBetween" }}
            flexWrap={description ? { default: "nowrap" } : undefined}
          >
            <FlexItem flex={description ? { default: "flex_1" } : undefined}>
              <Content component="h1">{pageTitle}</Content>
              {description}
            </FlexItem>
            <FlexItem>{actions}</FlexItem>
          </Flex>
        ) : (
          <>
            <Content component="h1">{pageTitle}</Content>
            {description}
          </>
        )}
      </Content>
    </PageSection>
    {/* The content section scrolls on its own, so the breadcrumbs and title above it stay in view. */}
    <PageSection
      hasBodyWrapper={false}
      {...props}
      style={{ flex: "1 1 auto", minHeight: 0, overflow: "auto", ...style }}
      isFilled
      padding={{ default: "padding" }}
    >
      {children}
    </PageSection>
  </>
);
