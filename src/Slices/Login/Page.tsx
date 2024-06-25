import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginPage, ListVariant } from "@patternfly/react-core";
import styled from "styled-components";
import { useLogin } from "@/Data/Managers/V2/Login";
import { DependencyContext, words } from "@/UI";
import { UserCredentialsForm } from "@/UI/Components/UserCredentialsForm";
import logo from "@images/logo.svg";

/**
 * Login component.
 * This component is responsible for rendering the login page.
 * @note This is being used only when databse authentication is enabled.
 * @returns {React.FunctionComponent} The rendered component.
 */
export const Login: React.FunctionComponent = () => {
  const { authHelper } = useContext(DependencyContext);
  const navigate = useNavigate();

  const { mutate, isError, error, isSuccess, isPending, data } = useLogin();

  useEffect(() => {
    if (isSuccess) {
      authHelper.updateUser(data.data.user.username, data.data.token);
      navigate("/");
    }
  }, [data, isSuccess, authHelper, navigate]);

  return (
    <Wrapper>
      <StyledLogin
        brandImgSrc={logo}
        footerListVariants={ListVariant.inline}
        brandImgAlt="Inmanta logo"
        loginTitle={words("login.title")}
        loginSubtitle={words("login.subtitle")}
      >
        <UserCredentialsForm
          isError={isError}
          isPending={isPending}
          error={error}
          onSubmit={(username, password) => mutate({ username, password })}
          submitButtonText={words("login.login")}
        />
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
