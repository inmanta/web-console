import React from "react";
import { LoginPage, ListVariant } from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@/UI";
import logo from "@images/cut-wings.svg";
import { LoginPageComponent } from "./UI/LoginForm";

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
    <LoginPage
      backgroundImgSrc={logo}
      footerListVariants={ListVariant.inline}
      loginTitle={words("login.title")}
      loginSubtitle={words("login.subtitle")}
    >
      <LoginPageComponent submitButtonText={words("login.login")} />
    </LoginPage>
  );
};
