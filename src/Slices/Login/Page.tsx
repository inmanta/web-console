import React from "react";
import { LoginPage, ListVariant } from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@/UI";
import logo from "@images/logo.svg";
import { LoginForm } from "./UI/LoginForm";

/**
 * Login component.
 * This component is responsible for rendering the login page.
 * @note This is being used only when database authentication is enabled.
 * @returns {React.FC} The rendered component.
 */
export const Login: React.FC = () => {
  return (
    <Wrapper>
      <StyledLogin
        brandImgSrc={logo}
        footerListVariants={ListVariant.inline}
        brandImgAlt="Inmanta logo"
        loginTitle={words("login.title")}
        loginSubtitle={words("login.subtitle")}
      >
        <LoginForm submitButtonText={words("login.login")} />
      </StyledLogin>
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
const StyledLogin = styled(LoginPage)`
  background-color: var(--pf-v5-global--BackgroundColor--dark-300);
  .pf-v5-c-login__container {
    @media (min-width: 1200px) {
      width: 100%;
      max-width: 500px !important;
      display: block !important;
      padding-inline-start: 0px;
      padding-inline-end: 0px;
    }
  }
`;
