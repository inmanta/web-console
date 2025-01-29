import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  DataListAction,
  ContentVariants,
  Flex,
  Dropdown,
  MenuToggleElement,
  MenuToggle,
  DropdownList,
  DropdownItem,
  Content,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { ServiceModel } from "@/Core";
import { useDeleteService } from "@/Data/Managers/V2/Service";
import { ConfirmUserActionForm, ToastAlert } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { SummaryIcons } from "./SummaryIcons";

interface Props {
  service: ServiceModel;
}

/**
 * ServiceItem is a component that displays a service item.
 *
 * @props {Props} props - The props of the component.
 * @prop {ServiceModel} service - The service model.
 *
 * @returns {React.FC<Props>} A React component that displays a service item.
 */
export const ServiceItem: React.FC<Props> = ({ service }) => {
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { routeManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const { mutate, isError, error } = useDeleteService(service.name);
  const [errorMessage, setErrorMessage] = useState("");
  const serviceKey = service.name + "-item";
  const rowRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  /**
   * Handles the submission of deleting the service.
   * if there is an error, it will set the error message,
   *
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  const onSubmit = async (): Promise<void> => {
    closeModal();
    await mutate();
  };

  /**
   * Toggles a dropdown menu.
   *
   * @returns {void}
   */
  const onToggleClick = (): void => {
    setIsOpen(!isOpen);
  };

  /**
   * Opens a modal with a confirmation form.
   *
   * @returns {void}
   */
  const openModal = (): void => {
    triggerModal({
      title: words("catalog.delete.modal.title"),
      content: (
        <>
          {words("catalog.delete.title")(service.name)}
          <ConfirmUserActionForm onSubmit={onSubmit} onCancel={closeModal} />
        </>
      ),
    });
  };

  useEffect(() => {
    if (isError) {
      setErrorMessage(error.message);
    }
  }, [isError, error]);

  return (
    <DataListItem id={service.name} aria-labelledby={serviceKey}>
      <ToastAlert
        data-testid="ToastAlert"
        title={words("catalog.delete.failed")}
        message={errorMessage}
        setMessage={setErrorMessage}
      />
      <span ref={(element) => (rowRefs.current[service.name] = element)} />
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="primary content">
              <Flex
                alignItems={{ default: "alignItemsFlexStart" }}
                columnGap={{ default: "columnGapMd" }}
              >
                <Content id={serviceKey} component="h2">
                  {service.name}
                </Content>
                {service.instance_summary && (
                  <Content>
                    <SummaryIcons summary={service.instance_summary} />
                  </Content>
                )}
              </Flex>
              {service.description && (
                <Content
                  component={ContentVariants.small}
                  id={`${service.name}-description`}
                >
                  {service.description}
                </Content>
              )}
            </DataListCell>,
          ]}
        />
        <DataListAction
          aria-labelledby={service.name + "-inventory"}
          id={service.name + "-inventory"}
          aria-label="Inventory Link"
        >
          <Link
            to={{
              pathname: routeManager.getUrl("Inventory", {
                service: service.name,
              }),
              search: location.search,
            }}
          >
            <Button variant="link">{words("catalog.button.inventory")}</Button>
          </Link>
        </DataListAction>
        <DataListAction
          aria-labelledby={service.name + "-action"}
          id={service.name + "-action"}
          aria-label="Actions"
        >
          <Dropdown
            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
              <MenuToggle
                ref={toggleRef}
                aria-label="Actions-dropdown"
                variant="plain"
                onClick={onToggleClick}
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
                  key={service.name + "-detailsLink"}
                  to={{
                    pathname: routeManager.getUrl("ServiceDetails", {
                      service: service.name,
                    }),
                    search: location.search,
                  }}
                >
                  {words("catalog.button.details")}
                </Link>
              </DropdownItem>
              <DropdownItem
                onClick={openModal}
                key={service.name + "-deleteButton"}
                aria-label={service.name + "-deleteButton"}
              >
                {words("delete")}
              </DropdownItem>
            </DropdownList>
          </Dropdown>
        </DataListAction>
      </DataListItemRow>
    </DataListItem>
  );
};
