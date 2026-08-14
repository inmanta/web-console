import React from "react";
import { Content, Flex, FlexItem, PageSection, PageSectionProps } from "@patternfly/react-core";

interface Props extends PageSectionProps {
  pageTitle: string | React.ReactNode;
  actions?: React.ReactNode;
}

export const PageContainer: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  pageTitle,
  actions,
  ...props
}) => (
  <>
    <PageSection hasBodyWrapper={false}>
      <Content>
        {actions ? (
          <Flex
            alignItems={{ default: "alignItemsCenter" }}
            justifyContent={{ default: "justifyContentSpaceBetween" }}
          >
            <FlexItem>
              <Content component="h1">{pageTitle}</Content>
            </FlexItem>
            <FlexItem>{actions}</FlexItem>
          </Flex>
        ) : (
          <Content component="h1">{pageTitle}</Content>
        )}
      </Content>
    </PageSection>
    <PageSection hasBodyWrapper={false} {...props} isFilled padding={{ default: "padding" }}>
      {children}
    </PageSection>
  </>
);
