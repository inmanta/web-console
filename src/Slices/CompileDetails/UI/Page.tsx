import React from 'react';
import { PageContainer } from '@/UI/Components';
import { useRouteParams } from '@/UI/Routing';
import { words } from '@/UI/words';
import { CompileDetails } from './CompileDetails';

export const Page: React.FC = () => {
  const { id } = useRouteParams<'CompileDetails'>();

  return (
    <PageContainer pageTitle={words('compileDetails.title')}>
      <CompileDetails id={id} />
    </PageContainer>
  );
};
