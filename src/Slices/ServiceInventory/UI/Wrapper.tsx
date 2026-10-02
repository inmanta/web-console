import React from "react";
import { Content, ContentVariants, ExpandableSection } from "@patternfly/react-core";
import { t_global_font_size_body_sm } from "@patternfly/react-tokens";
import { ServiceModel } from "@/Core";
import { PageContainer } from "@/UI/Components";
import { words } from "@/UI/words";
import { AddInstanceButton } from "./Components";

interface Props {
  name: string;
  service?: ServiceModel;
}

/**
 * The page frame of the Service Inventory. Once the service is loaded, the title row holds the
 * "Add instance" action and the service description shows under the title, cut to 2 lines.
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} name - The name of the service.
 *  @prop {ServiceModel} [service] - The service, undefined while it is loading.
 *
 * @returns {React.FC<Props>} The rendered page frame.
 */
export const Wrapper: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  name,
  service,
  ...props
}) => (
  <PageContainer
    {...props}
    hasOverflowScroll
    aria-label={words("inventory.title")(name)}
    pageTitle={words("inventory.title")(name)}
    actions={service && <AddInstanceButton serviceName={service.name} />}
    description={
      service?.description && (
        <ExpandableSection
          variant="truncate"
          truncateMaxLines={2}
          toggleContent={(isExpanded) => (
            <span style={{ fontSize: t_global_font_size_body_sm.var }}>
              {isExpanded ? words("showLess") : words("showMore")}
            </span>
          )}
        >
          <Content component={ContentVariants.small}>{service.description}</Content>
        </ExpandableSection>
      )
    }
  >
    {children}
  </PageContainer>
);
