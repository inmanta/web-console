import React, { useContext, useState } from "react";
import {
  Button,
  Content,
  ContentVariants,
  DataList,
  DataListAction,
  DataListCell,
  DataListContent,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListToggle,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Icon,
  MenuToggle,
  MenuToggleElement,
  Title,
  Truncate,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useAppAlert } from "@inmanta/web-console-core/Dependency/AppAlertContext";
import { ModalContext } from "@inmanta/web-console-core/Dependency/ModalContext";
import { useDeleteService } from "@inmanta/web-console-core/Queries/Slices/Service";
import { DynamicFAIcon } from "@inmanta/web-console-feature-lsm/Components/FaIcon";
import { InstanceSummaryLabels } from "@inmanta/web-console-feature-lsm/Components/InstanceSummaryLabels";
import { ConfirmUserActionForm } from "@inmanta/web-console-ui/Components/ConfirmUserActionForm";
import { Link } from "@inmanta/web-console-ui/Components/Link";
import { formatDescriptionLine, getServiceIconName } from "./helpers";
import { CatalogService } from "./types";

interface Props {
  service: CatalogService;
  hasServiceIcons: boolean;
  hasToggleColumn: boolean;
  isOwnedService: boolean;
  titleHeadingLevel: "h2" | "h3";
  expandedServiceNames: Set<string>;
  onToggleOwnedServices: (serviceName: string) => void;
}

/**
 * A service in the catalog data list: a toggle, an icon, the title with the entity name and owned
 * services count and the description below, the instance summary with the inventory link, and an
 * actions menu. Its owned services are a nested data list in the expandable content.
 *
 * @props {Props} props - The props of the component.
 *  @prop {CatalogService} service - The service, its resolved entity annotations and its owned services.
 *  @prop {boolean} hasServiceIcons - Whether the catalog shows service icons.
 *  @prop {boolean} hasToggleColumn - Whether the catalog has owned services. Rows without owned
 *  services then get a hidden toggle, as in PatternFly's mixed expandable data list example, so
 *  all rows line up.
 *  @prop {boolean} isOwnedService - Whether the service is listed under its owner. PatternFly drops
 *  the start padding of nested rows; the row gets it back, so every level is indented by the same amount.
 *  @prop {"h2" | "h3"} titleHeadingLevel - The heading level of the service title, one below the
 *  section heading when there is one.
 *  @prop {Set<string>} expandedServiceNames - The names of the services whose owned services are expanded.
 *  @prop {function} onToggleOwnedServices - Expands or collapses the owned services of a service.
 *
 * @returns {React.FC<Props>} A data list item for the service.
 */
export const ServiceDataListItem: React.FC<Props> = ({
  service,
  hasServiceIcons,
  hasToggleColumn,
  isOwnedService,
  titleHeadingLevel,
  expandedServiceNames,
  onToggleOwnedServices,
}) => {
  const { serviceModel, resolvedAnnotations } = service;
  const serviceName = serviceModel.name;
  const instanceSummary = serviceModel.instance_summary;
  const hasOwnedServices = service.ownedServices.length > 0;
  const isExpanded = expandedServiceNames.has(serviceName);
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
        {hasOwnedServices && (
          <DataListToggle
            id={`${serviceName}-toggle`}
            aria-controls={`${serviceName}-owned-services`}
            aria-label={words(
              isExpanded ? "catalog.ownedServices.collapse" : "catalog.ownedServices.expand"
            )(resolvedAnnotations.web_title)}
            isExpanded={isExpanded}
            onClick={() => onToggleOwnedServices(serviceName)}
          />
        )}
        {!hasOwnedServices && hasToggleColumn && (
          <DataListToggle
            id={`${serviceName}-toggle`}
            buttonProps={{ disabled: true, "aria-hidden": "true", style: { visibility: "hidden" } }}
          />
        )}
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
                    <ServiceTitleLink pathname={inventoryPathname} variant="plain" fitContent>
                      {resolvedAnnotations.web_title}
                    </ServiceTitleLink>
                  </Title>
                  {resolvedAnnotations.web_title !== serviceName && (
                    <FlexItem>
                      <Content component={ContentVariants.small}>{serviceName}</Content>
                    </FlexItem>
                  )}
                  {hasOwnedServices && (
                    <FlexItem>
                      <Content component={ContentVariants.small}>
                        {words("catalog.ownedServices.count")(service.ownedServices.length)}
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
                <FlexItem>
                  {instanceSummary && Number(instanceSummary.total) > 0 ? (
                    <InstanceSummaryLabels byLabel={instanceSummary.by_label} />
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
                hasToggleColumn={hasToggleColumn}
                isOwnedService
                titleHeadingLevel={titleHeadingLevel}
                expandedServiceNames={expandedServiceNames}
                onToggleOwnedServices={onToggleOwnedServices}
              />
            ))}
          </DataList>
        </OwnedServicesContent>
      )}
    </DataListItem>
  );
};

interface ServiceActionsProps {
  service: CatalogService;
  titleId: string;
}

/**
 * The actions menu of a service in the catalog data list, with details and delete.
 *
 * @props {ServiceActionsProps} props - The props of the component.
 *  @prop {CatalogService} service - The service the actions apply to.
 *  @prop {string} titleId - The id of the service title, which labels the actions together with their own id.
 *
 * @returns {React.FC<ServiceActionsProps>} The data list action of the service.
 */
const ServiceActions: React.FC<ServiceActionsProps> = ({ service, titleId }) => {
  const serviceName = service.serviceModel.name;
  const actionsId = `${serviceName}-actions`;
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { routeManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const { notifyError } = useAppAlert();
  const { mutate } = useDeleteService(serviceName, {
    onError: (error) =>
      notifyError({
        title: words("catalog.delete.failed"),
        message: error.message,
      }),
  });

  /**
   * Handles the submission of deleting the service.
   */
  const onSubmit = (): void => {
    closeModal();
    mutate();
  };

  /**
   * Opens a modal with a confirmation form.
   */
  const openModal = (): void => {
    triggerModal({
      title: words("catalog.delete.modal.title"),
      content: (
        <>
          {words("catalog.delete.title")(serviceName)}
          <ConfirmUserActionForm onSubmit={onSubmit} onCancel={closeModal} />
        </>
      ),
    });
  };

  return (
    <DataListAction
      id={actionsId}
      aria-labelledby={`${titleId} ${actionsId}`}
      aria-label={words("actions")}
    >
      <Dropdown
        isOpen={isOpen}
        onSelect={() => setIsOpen(false)}
        onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
        popperProps={{ position: "right" }}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            aria-label="Actions-dropdown"
            variant="plain"
            isExpanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            icon={<EllipsisVIcon />}
          />
        )}
      >
        <DropdownList>
          <DropdownItem>
            <Link pathname={routeManager.getUrl("ServiceDetails", { service: serviceName })}>
              {words("showDetails")}
            </Link>
          </DropdownItem>
          <DropdownItem onClick={openModal} aria-label={serviceName + "-deleteButton"}>
            {words("delete")}
          </DropdownItem>
        </DropdownList>
      </Dropdown>
    </DataListAction>
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

/**
 * The service title, a link to its inventory. It has the regular text color and only shows as a
 * link on hover.
 */
const ServiceTitleLink = styled(Link)`
  &:hover {
    color: var(--pf-t--global--text--color--link--hover);
    text-decoration: underline;
  }
`;
