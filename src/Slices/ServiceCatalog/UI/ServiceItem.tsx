import React, { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  DataListAction,
  Text,
  Title,
  TextVariants,
  Flex,
  Dropdown,
  MenuToggleElement,
  MenuToggle,
  DropdownList,
  DropdownItem,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { Maybe, ServiceModel } from "@/Core";
import { Spacer, ConfirmUserActionForm, ToastAlert } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { greyText } from "@/UI/Styles";
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
  const { routeManager, commandResolver } = useContext(DependencyContext);
  const rowRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const [isOpen, setIsOpen] = useState(false);
  const serviceKey = service.name + "-item";
  const trigger = commandResolver.useGetTrigger<"DeleteService">({
    kind: "DeleteService",
    name: service.name,
  });
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Handles the submission of deleting the service.
   * if there is an error, it will set the error message, otherwise it will dispatch an event to notify the service has been deleted.
   *
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  const onSubmit = async (): Promise<void> => {
    closeModal();
    const result = await trigger();

    if (Maybe.isSome(result)) {
      setErrorMessage(result.value);
    } else {
      document.dispatchEvent(new CustomEvent("service-deleted"));
    }
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
            <StyledDataListCell key="primary content">
              <Flex alignItems={{ default: "alignItemsCenter" }}>
                <Title id={serviceKey} headingLevel="h2" size="xl">
                  {service.name}
                </Title>
                {service.instance_summary && (
                  <SummaryIcons summary={service.instance_summary} />
                )}
              </Flex>
              {service.description && (
                <div id={`${service.name}-description`}>
                  <Spacer />
                  <StyledText component={TextVariants.small}>
                    {service.description}
                  </StyledText>
                  <Spacer />
                </div>
              )}
            </StyledDataListCell>,
          ]}
        />
        <DataListAction
          aria-labelledby={service.name + "-inventory"}
          id={service.name + "-inventory"}
          aria-label="Inventory Link"
          isPlainButtonAction
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
          isPlainButtonAction
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

const StyledText = styled(Text)`
  ${greyText};
`;

const StyledDataListCell = styled(DataListCell)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
