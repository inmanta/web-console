import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { LoginForm } from "@patternfly/react-core";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import { useLogin } from "@/Data/Queries/V2/Auth";
import { DependencyContext, words, PrimaryBaseUrlManager } from "@/UI";

interface Props {
  submitButtonText: string;
  submitButtonLabel?: string;
}

/**
 * LoginForm component.
 * @props {Props} props - The component
 * @prop {string} submitButtonText - The text to display on the submit button.
 * @prop {string} submitButtonLabel - The aria-label for the submit button.
 *
 * @returns {React.FC<Props>} The rendered component.
 */
export const LoginPageComponent: React.FC<Props> = ({ submitButtonText }) => {
  const { authHelper } = useContext(DependencyContext);
  const navigate = useNavigate();
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const basePathname = baseUrlManager.getBasePathname();

  const { data, mutate, isSuccess, isError, error } = useLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Handle the change of the username input field.
   * @param {React.FormEvent<HTMLInputElement>} _event - The event object.
   * @param {string} value - The current value of the input field.
   *
   * @returns {void}
   */
  const handleUsernameChange = (_event: React.FormEvent<HTMLInputElement>, value: string): void => {
    setUsername(value);
  };

  /**
   * Handle the change of the password input field.
   * @param {React.FormEvent<HTMLInputElement>} _event The event object.
   * @param {string} value The current value of the input field.
   *
   * @returns {void}
   */
  const handlePasswordChange = (_event: React.FormEvent<HTMLInputElement>, value: string): void => {
    setPassword(value);
  };

  /**
   * Handles the submission of the login form.
   *
   * This function is responsible for preventing the default form submission behavior and then calling the mutate function with the current username and password.
   * @param {React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>} event - The event that triggered the form submission.
   *
   * @returns {void} A Promise that resolves when the operation is complete.
   */
  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    event.preventDefault();
    mutate({ username, password });
  };

  useEffect(() => {
    if (isSuccess) {
      authHelper.updateUser(data.data.user.username, data.data.token);
      navigate(basePathname);
    }
  }, [isSuccess, navigate, data, authHelper, basePathname]);

  return (
    <LoginForm
      showHelperText={isError}
      helperText={error?.message}
      helperTextIcon={<ExclamationCircleIcon />}
      usernameLabel={words("username")}
      usernameValue={username}
      onChangeUsername={handleUsernameChange}
      passwordLabel={words("password")}
      passwordValue={password}
      onChangePassword={handlePasswordChange}
      onLoginButtonClick={handleSubmit}
      loginButtonLabel={submitButtonText}
    />
  );
};
