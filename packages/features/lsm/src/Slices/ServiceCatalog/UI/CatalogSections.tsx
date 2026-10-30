import React, { useMemo } from "react";
import { Content, ContentVariants, Flex, Stack, StackItem, Title } from "@patternfly/react-core";
import { Table, Tbody, Td, Tr } from "@patternfly/react-table";
import { ServiceModel, words } from "@inmanta/web-console-core";
import { ServiceRow } from "./ServiceRow";
import { createCatalogSections, getSectionInstanceCount, getSectionTitle } from "./helpers";
import { CatalogSection, serviceRowColumnCount } from "./types";

interface Props {
  serviceModels: ServiceModel[];
}

/**
 * The service catalog: one table per section, each under a heading with its service and
 * instance count. A section is a `web_group`, or "Other services" for the services without one.
 * Without any group, the catalog is a single table without heading. When any service has a
 * `web_icon`, every row shows an icon, with a fallback for the services without one; otherwise
 * the rows have no icon.
 *
 * @props {Props} props - The props of the component.
 *  @prop {ServiceModel[]} serviceModels - The services in the catalog.
 *
 * @returns {React.FC<Props>} The service catalog sections.
 */
export const CatalogSections: React.FC<Props> = ({ serviceModels }) => {
  const sections = useMemo(() => createCatalogSections(serviceModels), [serviceModels]);
  const hasGroups = sections.some((section) => section.kind === "Group");
  const hasServiceIcons = sections.some((section) =>
    section.services.some(({ resolvedAnnotations }) => resolvedAnnotations.web_icon !== undefined)
  );

  return (
    <Stack hasGutter>
      {sections.map((section) => (
        <StackItem key={`${section.kind}-${getSectionTitle(section)}`}>
          <Table
            variant="compact"
            aria-label={hasGroups ? getSectionTitle(section) : words("catalog.title")}
          >
            <Tbody>
              {hasGroups && (
                <Tr>
                  <Td colSpan={serviceRowColumnCount}>{renderSectionHeading(section)}</Td>
                </Tr>
              )}
              {section.services.map((service) => (
                <ServiceRow
                  key={service.serviceModel.name}
                  service={service}
                  hasServiceIcons={hasServiceIcons}
                />
              ))}
            </Tbody>
          </Table>
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
    <Title headingLevel="h2" size="md">
      {getSectionTitle(section)}
    </Title>
    <Content component={ContentVariants.small}>
      {words("catalog.section.count")(section.services.length, getSectionInstanceCount(section))}
    </Content>
  </Flex>
);
