import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { CatalogDataList } from './CatalogDataList';
import { useStoreState, State, useStoreDispatch, Dispatch, Action } from 'easy-peasy';
import { IStoreModel } from '@app/Models/core-models';

const ServiceCatalog: React.FunctionComponent<any> = (props) => {
  const project = useStoreState((store: State<IStoreModel>) => store.projects.selectedProject);
  const dispatch = useStoreDispatch<IStoreModel>();

  if (project.selectedEnvironment.id && !project.selectedEnvironment.services) {
    fetchServiceCatalog(dispatch, project.selectedEnvironment.id);
  }

  return (
    <PageSection>
      <Title size="lg">Service Catalog Page Title</Title>
      <CatalogDataList services={project.selectedEnvironment.services} />
    </PageSection>
  );
}

async function fetchServiceCatalog(dispatch: Dispatch<IStoreModel, Action<any>>, environmentId: string) {
  try {
    const result = await fetch(process.env.API_BASEURL + "/lsm/v1/service_catalog", {
      headers: {
        "X-Inmanta-Tid": environmentId
      }
    })
    const json = await result.json();
    dispatch.projects.selectedProject.selectedEnvironment.addServices(json.data);
  } catch (error) {
    throw error;
  }
}

export { ServiceCatalog };
