import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { useStoreState, State } from 'easy-peasy';
import { IStoreModel } from '@app/Models/core-models';


const Project = () => {
  const projects = useStoreState((state: State<IStoreModel>) => state.projects);
  return (
    <div>
      <div>{ projects.selectedProject && projects.selectedProject.name }</div>
      <div>{ projects.selectedProject && projects.selectedProject.selectedEnvironment && projects.selectedProject.selectedEnvironment.name }</div>
    </div>
  );
}

const Dashboard: React.FunctionComponent<any> = (props) => {
  return (
    <PageSection>
      <Title size="lg">Dashboard Page Title</Title>
      <Project />
    </PageSection>
  );
}

export { Dashboard };
