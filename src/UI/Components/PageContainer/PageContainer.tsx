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
    <PageSection hasBodyWrapper={false} {...props} isFilled padding={{ default: "padding" }}>
      {children}
    </PageSection>
  </>
);
