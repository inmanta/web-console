import React from "react";
import {
  Content,
  ContentVariants,
  DataList,
  Flex,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@inmanta/web-console-core";
import { ServiceDataListItem } from "./ServiceDataListItem";
import { getAllCatalogServices, getSectionInstanceCount, getSectionTitle } from "./helpers";
import { CatalogSection } from "./types";

interface Props {
  sections: CatalogSection[];
  expandedServiceNames: Set<string>;
  onToggleOwnedServices: (serviceName: string) => void;
}

/**
 * The service catalog: one data list per section, each under a heading with its service and
 * instance count. A section is a `web_group`, or "Other services" for the services without one.
 * Owned services are a nested data list under their owner. Without any group, the catalog is a
 * single list without heading, and without any owned service, there is no toggle column.
 * When any service has a `web_icon`, every row shows an icon, with a fallback for the services
 * without one; otherwise the rows have no icon.
 *
 * @props {Props} props - The props of the component.
 *  @prop {CatalogSection[]} sections - The catalog sections, from createCatalogSections.
 *  @prop {Set<string>} expandedServiceNames - The names of the services whose owned services are expanded.
 *  @prop {function} onToggleOwnedServices - Expands or collapses the owned services of a service.
 *
 * @returns {React.FC<Props>} The service catalog sections.
 */
export const CatalogSections: React.FC<Props> = ({
  sections,
  expandedServiceNames,
  onToggleOwnedServices,
}) => {
  const allServices = getAllCatalogServices(sections);
  const hasGroups = sections.some((section) => section.kind === "Group");
  const hasOwnedServices = allServices.some((service) => service.ownedServices.length > 0);
  const hasServiceIcons = allServices.some(
    ({ resolvedAnnotations }) => resolvedAnnotations.web_icon !== undefined
  );

  return (
    <Stack hasGutter>
      {sections.map((section) => (
        <StackItem key={`${section.kind}-${getSectionTitle(section)}`}>
          <Stack hasGutter>
            {hasGroups && renderSectionHeading(section)}
            <CatalogDataList
              isCompact
              aria-label={hasGroups ? getSectionTitle(section) : words("catalog.title")}
            >
              {section.services.map((service) => (
                <ServiceDataListItem
                  key={service.serviceModel.name}
                  service={service}
                  hasServiceIcons={hasServiceIcons}
                  hasToggleColumn={hasOwnedServices}
                  isOwnedService={false}
                  titleHeadingLevel={hasGroups ? "h3" : "h2"}
                  expandedServiceNames={expandedServiceNames}
                  onToggleOwnedServices={onToggleOwnedServices}
                />
              ))}
            </CatalogDataList>
          </Stack>
        </StackItem>
      ))}
    </Stack>
  );
};

/**
 * Renders the heading of a catalog section with its service and instance count.
 */
const renderSectionHeading = (section: CatalogSection): React.ReactNode => (
  <Flex alignItems={{ default: "alignItemsBaseline" }} columnGap={{ default: "columnGapSm" }}>
    <Title headingLevel="h2" size="lg">
      {getSectionTitle(section)}
    </Title>
    <Content component={ContentVariants.small}>
      {words("catalog.section.count")(section.services.length, getSectionInstanceCount(section))}
    </Content>
  </Flex>
);

/**
 * Centers the toggle, cells and actions of every row, nested ones included, as in the design.
 * PatternFly aligns them to the top of the row and has no prop for this. This overrides the
 * PF-internal `pf-v6-c-data-list__item-row`, `__item-content` and `__item-action` classes, so
 * check it after a PatternFly upgrade.
 */
const CatalogDataList = styled(DataList)`
  .pf-v6-c-data-list__item-row,
  .pf-v6-c-data-list__item-content,
  .pf-v6-c-data-list__item-action {
    align-items: center;
  }
`;
