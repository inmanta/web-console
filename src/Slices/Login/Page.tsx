import React from 'react';
import { LoginPage, ListVariant } from '@patternfly/react-core';
import styled from 'styled-components';
import { words } from '@/UI';
import logo from '@images/logo.svg';
import { LoginForm } from './UI/LoginForm';

/**
 * PF-MIGRATION TODO : UPDATE based on new guidelines
 *
 * Login component.
 * This component is responsible for rendering the login page.
 * @note This is being used only when database authentication is enabled.
 * @returns {React.FC} The rendered component.
 */
export const Login: React.FC = () => {
  return (
    <Wrapper>
      <LoginPage
        brandImgSrc={logo}
        footerListVariants={ListVariant.inline}
        brandImgAlt="Inmanta logo"
        loginTitle={words('login.title')}
        loginSubtitle={words('login.subtitle')}
      >
        <LoginForm submitButtonText={words('login.login')} />
      </LoginPage>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  z-index: 99999;
  position: absolute;
  top: 0;
  left: 0;
`;
