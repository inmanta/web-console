import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { CatalogAccordion } from './CatalogAccordion';
import { useStoreState, State, useStoreDispatch } from 'easy-peasy';
import { IStoreModel } from '@app/Models/core-models';

const ServiceCatalog: React.FunctionComponent<any> = (props) => {
  const project = useStoreState((store:State<IStoreModel>) => store.projects.selectedProject);
  const dispatch = useStoreDispatch<IStoreModel>();
  
  if (project.selectedEnvironment.id && !project.selectedEnvironment.services) {

    fetch(process.env.API_BASEURL + "/lsm/v1/service_catalog", {
      headers: {
        "X-Inmanta-Tid": project.selectedEnvironment.id
      }
    }).then(result => result.json()).then(result => {
      // console.log(result.data);
      dispatch.projects.selectedProject.selectedEnvironment.addServices(result.data);
    });
  }
  
  return (
    <PageSection>
      <Title size="lg">Service Catalog Page Title</Title>
      <CatalogAccordion services={project.selectedEnvironment.services} />
    </PageSection>
  );
}

export { ServiceCatalog };
