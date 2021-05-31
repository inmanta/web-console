import React, { useState } from "react";
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
  Alert,
  AlertActionCloseButton,
  Modal,
  Text,
  Title,
  TextVariants,
  ModalVariant,
  AlertGroup,
} from "@patternfly/react-core";
import { ServiceModel } from "@/Core";
import { CatalogContent } from "./CatalogContent";
import { Link } from "react-router-dom";
import { IRequestParams } from "@/UI/App/utils/fetchInmantaApi";
import { DeleteForm } from "@/UI/Pages/ServiceInstanceForm/Delete";
import { Routing } from "@/UI/Routing";
import { words } from "@/UI";
import { SummaryIcons } from "./SummaryIcons";

interface Props {
  services: ServiceModel[];
  environmentId: string;
  serviceCatalogUrl: string;
  keycloak?: Keycloak.KeycloakInstance;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  dispatch?: (data) => any;
}

export const CatalogDataList: React.FunctionComponent<Props> = ({
  services,
  environmentId,
  serviceCatalogUrl,
  keycloak,
  dispatch,
}) => {
  const [expanded, setExpanded] = useState([""]);
  const [errorMessage, setErrorMessage] = React.useState("");

  const Description = (descriptionProps) => {
    if (descriptionProps.service.description) {
      return (
        <div id={`${descriptionProps.service.name}-description`}>
          <div className="spacer-with-padding-xs" />
          <Text component={TextVariants.small} className="patternfly-text-gray">
            {descriptionProps.service.description}
          </Text>
          <div className="spacer-with-padding-xs" />
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
    const requestParams = {
      dispatch: dispatch,
      environmentId: environmentId,
      isEnvironmentIdRequired: true,
      keycloak: keycloak,
      method: "DELETE",
      setErrorMessage,
      urlEndpoint: `${serviceCatalogUrl}/${serviceName}`,
    } as IRequestParams;
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
                {service && <SummaryIcons summary={service.instance_summary} />}
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
                pathname: Routing.getUrl("Inventory", {
                  service: service.name,
                }),
                search: location.search,
              }}
            >
              <Button>{words("catalog.button.inventory")}</Button>
            </Link>
            <DeleteEntityModal
              serviceName={service.name}
              requestParams={requestParams}
            />
          </DataListAction>
        </DataListItemRow>
        <DataListContent
          aria-label="Primary Content Details"
          id={expandKey}
          isHidden={!expanded.includes(toggleId)}
        >
          <CatalogContent service={service} />
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
    <React.Fragment>
      {errorMessage && (
        <AlertGroup isToast={true}>
          <Alert
            variant="danger"
            title={errorMessage}
            actionClose={
              <AlertActionCloseButton onClose={() => setErrorMessage("")} />
            }
          />
        </AlertGroup>
      )}
      <DataList aria-label="List of service entities">{serviceItems}</DataList>
    </React.Fragment>
  );
};

const DeleteEntityModal: React.FunctionComponent<{
  serviceName: string;
  requestParams: IRequestParams;
}> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };
  return (
    <React.Fragment>
      <Button variant="danger" onClick={handleModalToggle}>
        {" "}
        Delete{" "}
      </Button>
      <Modal
        variant={ModalVariant.small}
        isOpen={isOpen}
        title="Delete Service Entity"
        onClose={handleModalToggle}
      >
        {`Are you sure you want to delete service entity ${props.serviceName}?`}
        <DeleteForm
          requestParams={props.requestParams}
          closeModal={() => setIsOpen(false)}
        />
      </Modal>
    </React.Fragment>
  );
};
