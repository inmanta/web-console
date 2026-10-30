import React, { useContext, useState } from "react";
import {
  Button,
  Content,
  ContentVariants,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  Icon,
  MenuToggle,
  MenuToggleElement,
  Truncate,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { Td, Tr } from "@patternfly/react-table";
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
}

/**
 * A service in the catalog table: its icon, title and one-line description, its instance
 * summary, a link to its inventory and an actions menu with details and delete.
 *
 * @props {Props} props - The props of the component.
 *  @prop {CatalogService} service - The service and its resolved entity annotations.
 *  @prop {boolean} hasServiceIcons - Whether the catalog shows service icons. A service without a `web_icon` then gets a fallback icon, so the titles line up.
 *
 * @returns {React.FC<Props>} A table row for the service.
 */
export const ServiceRow: React.FC<Props> = ({ service, hasServiceIcons }) => {
  const { serviceModel, resolvedAnnotations } = service;
  const instanceSummary = serviceModel.instance_summary;
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { routeManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const { notifyError } = useAppAlert();
  const { mutate } = useDeleteService(serviceModel.name, {
    onError: (error) =>
      notifyError({
        title: words("catalog.delete.failed"),
        message: error.message,
      }),
  });
  const serviceKey = serviceModel.name + "-item";
  const inventoryPathname = routeManager.getUrl("Inventory", { service: serviceModel.name });

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
          {words("catalog.delete.title")(serviceModel.name)}
          <ConfirmUserActionForm onSubmit={onSubmit} onCancel={closeModal} />
        </>
      ),
    });
  };

  return (
    <Tr id={serviceModel.name} data-testid={serviceKey}>
      <Td dataLabel={words("catalog.column.service")}>
        <Flex
          alignItems={{ default: "alignItemsCenter" }}
          columnGap={{ default: "columnGapMd" }}
          flexWrap={{ default: "nowrap" }}
        >
          {hasServiceIcons && (
            <ServiceIconTile iconSize="md">
              <DynamicFAIcon
                icon={getServiceIconName(service)}
                color="var(--pf-t--global--icon--color--brand--default)"
                attr={{ "aria-hidden": true }}
              />
            </ServiceIconTile>
          )}
          <Flex
            direction={{ default: "column" }}
            gap={{ default: "gapNone" }}
            flex={{ default: "flex_1" }}
          >
            <Flex
              alignItems={{ default: "alignItemsBaseline" }}
              columnGap={{ default: "columnGapSm" }}
            >
              <Link pathname={inventoryPathname} fitContent>
                <Button variant="link" isInline component="span">
                  {resolvedAnnotations.web_title}
                </Button>
              </Link>
              {resolvedAnnotations.web_title !== serviceModel.name && (
                <Content component={ContentVariants.small}>{serviceModel.name}</Content>
              )}
            </Flex>
            {resolvedAnnotations.web_description && (
              <Content component={ContentVariants.small} id={`${serviceModel.name}-description`}>
                <Truncate content={formatDescriptionLine(resolvedAnnotations.web_description)} />
              </Content>
            )}
          </Flex>
        </Flex>
      </Td>
      <Td dataLabel={words("catalog.column.instances")} modifier="fitContent">
        <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
          {instanceSummary && Number(instanceSummary.total) > 0 ? (
            <InstanceSummaryLabels byLabel={instanceSummary.by_label} />
          ) : (
            <Content component={ContentVariants.small}>{words("catalog.instances.none")}</Content>
          )}
        </Flex>
      </Td>
      <Td modifier="fitContent">
        <Link pathname={inventoryPathname} fitContent>
          <Button variant="link" component="span">
            {words("catalog.button.inventory")}
          </Button>
        </Link>
      </Td>
      <Td isActionCell>
        <Dropdown
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              aria-label="Actions-dropdown"
              variant="plain"
              onClick={() => setIsOpen(!isOpen)}
              isExpanded={isOpen}
            >
              <EllipsisVIcon />
            </MenuToggle>
          )}
          onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
          popperProps={{ position: "right" }}
          isOpen={isOpen}
          onSelect={() => setIsOpen(false)}
          aria-label="Actions-details"
        >
          <DropdownList>
            <DropdownItem>
              <Link
                pathname={routeManager.getUrl("ServiceDetails", { service: serviceModel.name })}
              >
                {words("showDetails")}
              </Link>
            </DropdownItem>
            <DropdownItem
              onClick={openModal}
              key={serviceModel.name + "-deleteButton"}
              aria-label={serviceModel.name + "-deleteButton"}
            >
              {words("delete")}
            </DropdownItem>
          </DropdownList>
        </Dropdown>
      </Td>
    </Tr>
  );
};

/**
 * A brand-tinted square behind the service icon, the size of the xl spacer, which no PatternFly
 * Icon size matches. `&&` lets the size win over PatternFly's own `pf-v6-c-icon` rule.
 */
const ServiceIconTile = styled(Icon)`
  && {
    --pf-v6-c-icon--Width: var(--pf-t--global--spacer--xl);
    --pf-v6-c-icon--Height: var(--pf-t--global--spacer--xl);

    border-radius: var(--pf-t--global--border--radius--small);
    background-color: var(--pf-t--global--color--brand--subtle--default);
  }
`;
