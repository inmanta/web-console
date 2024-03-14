import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LoginPage,
  ListVariant,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Form,
  FormGroup,
  TextInput,
  InputGroup,
  InputGroupItem,
  Button,
  ActionGroup,
  ValidatedOptions,
  Spinner,
  Text,
} from "@patternfly/react-core";
import {
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@patternfly/react-icons";
import styled from "styled-components";
import { createCookie } from "@/Data/Common/CookieHelper";
import { DependencyContext, words } from "@/UI";
import logo from "@images/logo.svg";
import { useLogin } from "../../Data/Managers/V2/Login/useLogin";

export const Login: React.FunctionComponent = () => {
  const { authController } = useContext(DependencyContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const { mutate, isError, error, isSuccess, isPending, data } = useLogin();
  const handleUsernameChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setUsername(value);
  };

  const handlePasswordChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setPassword(value);
  };

  const onLoginButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    mutate({ username, password });
  };

  useEffect(() => {
    if (isSuccess) {
      createCookie("inmanta_user", data.data.token, 1);
      // window.location.replace(window.location.origin + "/console");
      navigate(0);
      authController.setLocalUserName(data.data.user.username);
    }
  }, [data, isSuccess, authController, navigate]);

  return (
    <Wrapper>
      <StyledLogin
        brandImgSrc={logo}
        footerListVariants={ListVariant.inline}
        brandImgAlt="Inmanta logo"
        backgroundImgSrc="/assets/images/pfbg-icon.svg"
        loginTitle={words("login.title")}
        loginSubtitle={words("login.subtitle")}
      >
        <Form className="loginForm">
          {isError && error && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem
                  variant={isError ? "error" : "default"}
                  icon={<ExclamationCircleIcon />}
                  aria-label="error-message"
                >
                  {error.message}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
          <FormGroup label="Username" isRequired fieldId="pf-login-username-id">
            <TextInput
              // autoFocus={!noAutoFocus}
              id="pf-login-username-id"
              isRequired
              validated={ValidatedOptions.default}
              type="text"
              name="pf-login-username-id"
              aria-label="input-username"
              value={username}
              onChange={handleUsernameChange}
            />
          </FormGroup>
          <FormGroup
            label={"Password"}
            isRequired
            fieldId="pf-login-password-id"
          >
            {
              <InputGroup>
                <InputGroupItem isFill>
                  <TextInput
                    isRequired
                    type={isPasswordHidden ? "password" : "text"}
                    id="pf-login-password-id"
                    name="pf-login-password-id"
                    aria-label="input-password"
                    validated={ValidatedOptions.default}
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </InputGroupItem>
                <InputGroupItem>
                  <Button
                    variant="control"
                    onClick={() => setIsPasswordHidden(!isPasswordHidden)}
                    aria-label={
                      isPasswordHidden ? "show-password" : "hide-password"
                    }
                  >
                    {isPasswordHidden ? <EyeIcon /> : <EyeSlashIcon />}
                  </Button>
                </InputGroupItem>
              </InputGroup>
            }
          </FormGroup>
          <ActionGroup>
            <Button
              aria-label="login-button"
              variant="primary"
              type="submit"
              onClick={onLoginButtonClick}
              isBlock
              isDisabled={isPending}
            >
              {isPending ? (
                <Spinner size="md" />
              ) : (
                <Text>{words("login.login")}</Text>
              )}
            </Button>
          </ActionGroup>
        </Form>
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
