import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';
import { useStoreState } from 'easy-peasy';


const Project = () => {
  return (
    <div>
      <div>{useStoreState(state => state.projects.items.map(project => project.name))}</div>
      <div>{useStoreState(state => state.environments.items.map(environment => environment.name))}</div>
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
