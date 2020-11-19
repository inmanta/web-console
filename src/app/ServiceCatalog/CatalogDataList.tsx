import React, { useState } from 'react';
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
  ModalVariant, AlertGroup
} from '@patternfly/react-core';
import { IServiceModel } from '@app/Models/LsmModels';
import { CatalogContent } from './CatalogContent';
import { Link } from 'react-router-dom';
import { IRequestParams } from '@app/utils/fetchInmantaApi';
import { DeleteForm } from '@app/ServiceInventory/DeleteForm';

export const CatalogDataList: React.FunctionComponent<{ services?: IServiceModel[], environmentId: string, serviceCatalogUrl: string, keycloak?: Keycloak.KeycloakInstance, dispatch?: (data) => any }> = props => {
  const [expanded, setExpanded] = useState(['']);
  let serviceItems;
  const [errorMessage, setErrorMessage] = React.useState('');

  const Description = (descriptionProps) => {
    if (descriptionProps.service.description) {
      return <div id={`${descriptionProps.service.name}-description`}>
        <div className="spacer-with-padding-xs" />
        <Text component={TextVariants.small} className="patternfly-text-gray">{descriptionProps.service.description}</Text>
      </div>
    }
    return <div />
  };

  if (props.services) {
    serviceItems = props.services.map(service => {
      const toggleId = service.name + '-toggle';
      const serviceKey = service.name + '-item';
      const expandKey = service.name + '-expand';
      const requestParams = {
        dispatch: props.dispatch,
        environmentId: props.environmentId,
        isEnvironmentIdRequired: true,
        keycloak: props.keycloak,
        method: 'DELETE',
        setErrorMessage,
        urlEndpoint: `${props.serviceCatalogUrl}/${service.name}`,
      } as IRequestParams;
      return (
        <DataListItem key={serviceKey} aria-labelledby={serviceKey} isExpanded={expanded.includes(toggleId)}>
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
                  <Title id={serviceKey} headingLevel="h2" size="xl">{service.name}</Title>
                  <Description service={service}/>
                </DataListCell>
              ]}
            />
            <DataListAction
              aria-labelledby={service.name + '-action'}
              id={service.name + '-action'}
              aria-label="Actions"
            >
              <Link to={{pathname:`/lsm/catalog/${service.name}/inventory`, search: location.search }}> <Button> Inventory </Button></Link>
              <DeleteEntityModal serviceName={service.name} requestParams={requestParams} />
            </DataListAction>
          </DataListItemRow>
          <DataListContent aria-label="Primary Content Details" id={expandKey} isHidden={!expanded.includes(toggleId)}>
            <CatalogContent service={service} />
          </DataListContent>
        </DataListItem>
      );
    });
  }

  const onToggle = id => {
    const index = expanded.indexOf(id);
    const newExpanded =
      index >= 0 ? [...expanded.slice(0, index), ...expanded.slice(index + 1, expanded.length)] : [...expanded, id];
    setExpanded(newExpanded);
  };
  return <React.Fragment>
    {errorMessage && <AlertGroup isToast={true}> <Alert variant='danger' title={errorMessage} actionClose={<AlertActionCloseButton onClose={() => setErrorMessage('')} />} /></AlertGroup>}
    <DataList aria-label="List of service entities" >{serviceItems}</DataList>
  </React.Fragment>;
};

const DeleteEntityModal: React.FunctionComponent<{ serviceName: string, requestParams: IRequestParams }> = props => {
  const [isOpen, setIsOpen] = useState(false);
  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };
  return <React.Fragment>
    <Button variant="danger" onClick={handleModalToggle}> Delete </Button>
    <Modal variant={ModalVariant.small} isOpen={isOpen}
      title="Delete Service Entity" onClose={handleModalToggle}>
      {`Are you sure you want to delete service entity ${props.serviceName}?`}
      <DeleteForm requestParams={props.requestParams} closeModal={() => setIsOpen(false)} />
    </Modal>
  </React.Fragment>
}
