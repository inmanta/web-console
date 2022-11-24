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
  KebabToggle,
  Dropdown,
  Flex,
  Modal,
  ModalVariant,
} from "@patternfly/react-core";
import styled from "styled-components";
import { Maybe, ServiceModel } from "@/Core";
import { Spacer, ConfirmUserActionForm, ToastAlert } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { greyText } from "@/UI/Styles";
import { words } from "@/UI/words";
import { SummaryIcons } from "./SummaryIcons";

interface Props {
  service: ServiceModel;
}

export const ServiceItem: React.FunctionComponent<Props> = ({ service }) => {
  const { routeManager, commandResolver } = useContext(DependencyContext);
  const rowRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const [isOpen, setIsOpen] = useState(false);
  const serviceKey = service.name + "-item";
  const trigger = commandResolver.useGetTrigger<"DeleteService">({
    kind: "DeleteService",
    name: service.name,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleModalToggle = () => {
    setIsDeleteModalOpen(!isOpen);
  };
  const onSubmit = async () => {
    handleModalToggle();
    const result = await trigger();

    if (Maybe.isSome(result)) {
      setErrorMessage(result.value);
    }
  };
  return (
    <DataListItem id={service.name} aria-labelledby={serviceKey}>
      <ToastAlert
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
          aria-labelledby={service.name + "-action"}
          id={service.name + "-action"}
          aria-label="Actions"
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
          <Dropdown
            toggle={<KebabToggle onToggle={() => setIsOpen(!isOpen)} />}
            isOpen={isOpen}
            isPlain
            position="right"
            onSelect={() => setIsOpen(false)}
            aria-label="Actions-details"
            dropdownItems={[
              <Link
                key={service.name + "-detailsLink"}
                to={{
                  pathname: routeManager.getUrl("ServiceDetails", {
                    service: service.name,
                  }),
                  search: location.search,
                }}
              >
                <Button variant="link">
                  {words("catalog.button.details")}
                </Button>
              </Link>,
              <Button
                key={service.name + "-deleteButton"}
                aria-label={service.name + "-deleteButton"}
                variant="link"
                onClick={() => {
                  setIsDeleteModalOpen(true);
                }}
              >
                {words("delete")}
              </Button>,
            ]}
          />
        </DataListAction>
      </DataListItemRow>
      <Modal
        variant={ModalVariant.small}
        isOpen={isDeleteModalOpen}
        title={words("catalog.delete.modal.title")}
        onClose={handleModalToggle}
      >
        {words("catalog.delete.title")(service.name)}
        <ConfirmUserActionForm
          onSubmit={onSubmit}
          onCancel={handleModalToggle}
        />
      </Modal>
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
