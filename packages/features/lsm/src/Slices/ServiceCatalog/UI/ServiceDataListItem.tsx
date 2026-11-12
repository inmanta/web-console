import React, { useContext, useMemo, useState } from "react";
import {
  Button,
  Content,
  ContentVariants,
  DataList,
  DataListCell,
  DataListContent,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Icon,
  Title,
  Truncate,
} from "@patternfly/react-core";
import { RhMicronsCaretDownIcon, RhMicronsCaretUpIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { DynamicFAIcon } from "@inmanta/web-console-feature-lsm/Components/FaIcon";
import { InstanceSummaryLabels } from "@inmanta/web-console-feature-lsm/Components/InstanceSummaryLabels";
import { Link } from "@inmanta/web-console-ui/Components/Link";
import { OwnedServicesNotSuccessLabel } from "./OwnedServicesNotSuccessLabel";
import { ServiceActions } from "./ServiceActions";
import { formatDescriptionLine, getOwnedServicesStateCounts, getServiceIconName } from "./helpers";
import { CatalogService } from "./types";

interface Props {
  service: CatalogService;
  hasServiceIcons: boolean;
  isOwnedService: boolean;
  titleHeadingLevel: "h2" | "h3";
  isExpandedByDefault?: boolean;
  ownerNamesOfMatchingServices: Set<string>;
}

/**
 * A service in the catalog data list: an icon, the title with the entity name and the description
 * below, the instance summary with the inventory link, and an actions menu. A service with owned
 * services also shows their count, which expands or collapses them as a nested data list in the
 * expandable content. While collapsed, a "not success" label before the own labels counts the owned
 * services' instances that are not in a "success" state. Rows without owned services get no
 * toggle, so they look like a plain list.
 *
 * @props {Props} props - The props of the component.
 *  @prop {CatalogService} service - The service, its resolved entity annotations and its owned services.
 *  @prop {boolean} hasServiceIcons - Whether the catalog shows service icons.
 *  @prop {boolean} isOwnedService - Whether the service is listed under its owner. Its row is
 *  indented one level further than its owner's.
 *  @prop {"h2" | "h3"} titleHeadingLevel - The heading level of the service title, one below the
 *  section heading when there is one.
 *  @prop {boolean} [isExpandedByDefault] - Whether the owned services start expanded. When
 *  `undefined`, they start expanded only for an owner in ownerNamesOfMatchingServices. The row
 *  keeps its own expanded state after that.
 *  @prop {Set<string>} ownerNamesOfMatchingServices - The owners of the services matching the
 *  catalog filter.
 *
 * @returns {React.FC<Props>} A data list item for the service.
 */
export const ServiceDataListItem: React.FC<Props> = ({
  service,
  hasServiceIcons,
  isOwnedService,
  titleHeadingLevel,
  isExpandedByDefault,
  ownerNamesOfMatchingServices,
}) => {
  const { serviceModel, resolvedAnnotations } = service;
  const serviceName = serviceModel.name;
  const instanceSummary = serviceModel.instance_summary;
  const hasOwnedServices = service.ownedServices.length > 0;
  const [isExpanded, setIsExpanded] = useState(
    isExpandedByDefault ?? ownerNamesOfMatchingServices.has(serviceName)
  );
  const ownedServicesStateCounts = useMemo(() => getOwnedServicesStateCounts(service), [service]);
  const titleId = `${serviceName}-title`;
  const inventoryPathname = useContext(DependencyContext).routeManager.getUrl("Inventory", {
    service: serviceName,
  });

  return (
    <DataListItem
      id={serviceName}
      data-testid={serviceName + "-item"}
      aria-labelledby={titleId}
      isExpanded={isExpanded}
    >
      <ServiceRow $isOwnedService={isOwnedService}>
        <DataListItemCells
          dataListCells={[
            ...(hasServiceIcons
              ? [
                  <DataListCell isIcon key="icon">
                    <ServiceIconTile iconSize="lg">
                      <DynamicFAIcon
                        icon={getServiceIconName(service)}
                        isInline
                        color="var(--pf-t--global--icon--color--brand--default)"
                        attr={{ "aria-hidden": true }}
                      />
                    </ServiceIconTile>
                  </DataListCell>,
                ]
              : []),
            <DataListCell key="primary content">
              <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsNone" }}>
                <Flex
                  alignItems={{ default: "alignItemsBaseline" }}
                  spaceItems={{ default: "spaceItemsSm" }}
                >
                  <Title headingLevel={titleHeadingLevel} size="md" id={titleId}>
                    <Link pathname={inventoryPathname} fitContent>
                      {resolvedAnnotations.web_title}
                    </Link>
                  </Title>
                  {resolvedAnnotations.web_title !== serviceName && (
                    <FlexItem>
                      <Content component={ContentVariants.small}>{serviceName}</Content>
                    </FlexItem>
                  )}
                  {hasOwnedServices && (
                    <FlexItem>
                      <Content component={ContentVariants.small}>
                        <Button
                          id={`${serviceName}-toggle`}
                          variant="link"
                          isInline
                          icon={isExpanded ? <RhMicronsCaretUpIcon /> : <RhMicronsCaretDownIcon />}
                          iconPosition="end"
                          aria-expanded={isExpanded}
                          aria-controls={`${serviceName}-owned-services`}
                          aria-describedby={titleId}
                          onClick={() => setIsExpanded((current) => !current)}
                        >
                          {words("catalog.ownedServices.count")(service.ownedServices.length)}
                        </Button>
                      </Content>
                    </FlexItem>
                  )}
                </Flex>
                {resolvedAnnotations.web_description && (
                  <FlexItem>
                    <Content component={ContentVariants.p}>
                      <Truncate
                        content={formatDescriptionLine(resolvedAnnotations.web_description)}
                      />
                    </Content>
                  </FlexItem>
                )}
              </Flex>
            </DataListCell>,
            <DataListCell isFilled={false} alignRight key="secondary content">
              <Flex alignItems={{ default: "alignItemsCenter" }}>
                {!isExpanded && ownedServicesStateCounts.length > 0 && (
                  <FlexItem>
                    <OwnedServicesNotSuccessLabel stateCounts={ownedServicesStateCounts} />
                  </FlexItem>
                )}
                <FlexItem>
                  {instanceSummary && Number(instanceSummary.total) > 0 ? (
                    <InstanceSummaryLabels
                      summary={instanceSummary}
                      states={serviceModel.lifecycle.states}
                    />
                  ) : (
                    <Content component={ContentVariants.small}>
                      {words("catalog.instances.none")}
                    </Content>
                  )}
                </FlexItem>
                <FlexItem>
                  <Link pathname={inventoryPathname} fitContent>
                    <Button variant="link" component="span">
                      {words("catalog.button.inventory")}
                    </Button>
                  </Link>
                </FlexItem>
              </Flex>
            </DataListCell>,
          ]}
        />
        <ServiceActions service={service} titleId={titleId} />
      </ServiceRow>
      {hasOwnedServices && (
        <OwnedServicesContent
          id={`${serviceName}-owned-services`}
          aria-label={words("catalog.ownedServices.count")(service.ownedServices.length)}
          isHidden={!isExpanded}
          hasNoPadding
        >
          <DataList
            isCompact
            aria-label={words("catalog.ownedServices.count")(service.ownedServices.length)}
          >
            {service.ownedServices.map((ownedService) => (
              <ServiceDataListItem
                key={ownedService.serviceModel.name}
                service={ownedService}
                hasServiceIcons={hasServiceIcons}
                isOwnedService
                titleHeadingLevel={titleHeadingLevel}
                isExpandedByDefault={isExpandedByDefault}
                ownerNamesOfMatchingServices={ownerNamesOfMatchingServices}
              />
            ))}
          </DataList>
        </OwnedServicesContent>
      )}
    </DataListItem>
  );
};

/**
 * A brand-tinted square behind the service icon, as in the design. PatternFly's Icon has no
 * background, so the size and tint are set on its own variables. `&&` lets them win over
 * PatternFly's `pf-v6-c-icon` rule.
 */
const ServiceIconTile = styled(Icon)`
  && {
    --pf-v6-c-icon--Width: calc(
      var(--pf-t--global--font--size--body--default) *
        var(--pf-t--global--font--line-height--body) + 2 *
        var(--pf-t--global--spacer--control--vertical--default)
    );
    --pf-v6-c-icon--Height: var(--pf-v6-c-icon--Width);

    border-radius: var(--pf-t--global--border--radius--small);
    background-color: var(--pf-t--global--color--brand--subtle--default);
  }
`;

/**
 * A service row. PatternFly drops the start padding of a row nested in another row's expandable
 * content, so an owned service gets back the root row's padding (md, lg from the xl breakpoint)
 * and every level is indented by the same amount.
 */
const ServiceRow = styled(DataListItemRow)<{ $isOwnedService: boolean }>`
  && {
    ${({ $isOwnedService }) =>
      $isOwnedService && "padding-inline-start: var(--pf-t--global--spacer--lg);"}
  }
`;

/**
 * The expandable content holding the owned services. PatternFly gives it an end and bottom
 * margin, which would shift the nested rows' actions out of line with their owner's.
 */
const OwnedServicesContent = styled(DataListContent)`
  && {
    margin-inline-end: 0;
    margin-block-end: 0;
  }
`;
