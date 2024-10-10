import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
import { useLogin } from "@/Data/Managers/V2/POST/Login";
import { DependencyContext } from "@/UI";

interface LoginFormProps {
  submitButtonText: string;
  submitButtonLabel?: string;
}

/**
 * LoginForm component.
 * @param {LoginFormProps} props - The component props.
 * @returns {React.FC<LoginFormProps>} The rendered component.
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  submitButtonText,
  submitButtonLabel = "login-button",
}) => {
  const { authHelper } = useContext(DependencyContext);
  const navigate = useNavigate();

  const { data, mutate, isSuccess, isError, error, isPending } = useLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

  /**
   * Handle the change of the username input field.
   * @param {React.FormEvent<HTMLInputElement>} _event - The event object.
   * @param {string} value - The current value of the input field.
   */
  const handleUsernameChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setUsername(value);
  };

  /**
   * Handle the change of the password input field.
   * @param {React.FormEvent<HTMLInputElement>} _event The event object.
   * @param {string} value The current value of the input field.
   */
  const handlePasswordChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setPassword(value);
  };

  /**
   * Handles the submission of the login form.
   *
   * This function is responsible for preventing the default form submission behavior and then calling the mutate function with the current username and password.
   * @param {Event} event - The event that triggered the form submission.
   */
  const handleSubmit = (
    event:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    mutate({ username, password });
  };

  useEffect(() => {
    if (isSuccess) {
      authHelper.updateUser(data.data.user.username, data.data.token);
      navigate("/");
    }
  }, [isSuccess, navigate, data, authHelper]);

  return (
    <Form className="loginForm" onSubmit={handleSubmit}>
      {isError && error && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              variant="error"
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
      <FormGroup label={"Password"} isRequired fieldId="pf-login-password-id">
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
          aria-label={submitButtonLabel}
          variant="primary"
          type="submit"
          onClick={handleSubmit}
          isBlock
          isDisabled={isPending}
        >
          {isPending ? <Spinner size="md" /> : <Text>{submitButtonText}</Text>}
        </Button>
      </ActionGroup>
    </Form>
  );
};
