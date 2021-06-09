import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  Button,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListToggle,
  DataListItemCells,
  DataListCell,
  DataListContent,
  DataListAction,
  Modal,
  Text,
  Title,
  TextVariants,
  ModalVariant,
} from "@patternfly/react-core";
import { Maybe, ServiceModel } from "@/Core";
import { getUrl } from "@/UI/Routing/Utils";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ErrorToastAlert, DeleteForm } from "@/UI/Components";
import { greyText } from "@/UI/Styles";
import { CatalogTabs } from "./Tabs";
import { SummaryIcons } from "./SummaryIcons";

interface Props {
  services: ServiceModel[];
}

export const CatalogDataList: React.FunctionComponent<Props> = ({
  services,
}) => {
  const [expanded, setExpanded] = useState([""]);

  const Description = (descriptionProps) => {
    if (descriptionProps.service.description) {
      return (
        <div id={`${descriptionProps.service.name}-description`}>
          <Spacer />
          <StyledText component={TextVariants.small}>
            {descriptionProps.service.description}
          </StyledText>
          <Spacer />
        </div>
      );
    }
    return <div />;
  };
  const servicesById = services.reduce((acc, curr) => {
    acc[curr.name] = curr;
    return acc;
  }, {});

  const serviceItems = Object.keys(servicesById).map((serviceName) => {
    const service = servicesById[serviceName];
    const toggleId = serviceName + "-toggle";
    const serviceKey = serviceName + "-item";
    const expandKey = serviceName + "-expand";
    return (
      <DataListItem
        id={serviceName}
        key={serviceKey}
        aria-labelledby={serviceKey}
        isExpanded={expanded.includes(toggleId)}
      >
        <DataListItemRow>
          <DataListToggle
            onClick={() => onToggle(toggleId)}
            isExpanded={expanded.includes(toggleId)}
            id={toggleId}
            aria-controls={expandKey}
          />
          <DataListItemCells
            dataListCells={[
              <DataListCell key="primary content">
                <Title id={serviceKey} headingLevel="h2" size="xl">
                  {service.name}
                </Title>
                <Description service={service} />
                {service.instance_summary && (
                  <SummaryIcons summary={service.instance_summary} />
                )}
              </DataListCell>,
            ]}
          />
          <DataListAction
            aria-labelledby={service.name + "-action"}
            id={service.name + "-action"}
            aria-label="Actions"
          >
            <Link
              to={{
                pathname: getUrl("Inventory", {
                  service: service.name,
                }),
                search: location.search,
              }}
            >
              <Button>{words("catalog.button.inventory")}</Button>
            </Link>
            <DeleteEntityModal serviceName={service.name} />
          </DataListAction>
        </DataListItemRow>
        <DataListContent
          aria-label="Primary Content Details"
          id={expandKey}
          isHidden={!expanded.includes(toggleId)}
        >
          <CatalogTabs service={service} />
        </DataListContent>
      </DataListItem>
    );
  });

  const onToggle = (id) => {
    const index = expanded.indexOf(id);
    const newExpanded =
      index >= 0
        ? [
            ...expanded.slice(0, index),
            ...expanded.slice(index + 1, expanded.length),
          ]
        : [...expanded, id];
    setExpanded(newExpanded);
  };
  return (
    <DataList aria-label="List of service entities">{serviceItems}</DataList>
  );
};

const DeleteEntityModal: React.FunctionComponent<{
  serviceName: string;
}> = ({ serviceName }) => {
  const { commandResolver } = useContext(DependencyContext);
  const trigger = commandResolver.getTrigger<"DeleteService">({
    kind: "DeleteService",
    name: serviceName,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };
  const onSubmit = async () => {
    handleModalToggle();
    const result = await trigger();
    if (Maybe.isSome(result)) {
      setErrorMessage(result.value);
    }
  };
  return (
    <>
      <ErrorToastAlert
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
      <Button variant="danger" onClick={handleModalToggle}>
        {words("delete")}
      </Button>
      <Modal
        variant={ModalVariant.small}
        isOpen={isOpen}
        title="Delete Service Entity"
        onClose={handleModalToggle}
      >
        {words("catalog.delete.title")(serviceName)}
        <DeleteForm onSubmit={onSubmit} onCancel={handleModalToggle} />
      </Modal>
    </>
  );
};

const Spacer = styled.div`
  padding: var(--pf-global--spacer--xs);
`;

const StyledText = styled(Text)`
  ${greyText};
`;
