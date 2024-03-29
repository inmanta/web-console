import React, { useState } from "react";
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

interface UserCredentialsFormProps {
  onSubmit: (username: string, password: string) => void;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  submitButtonText: string;
  submitButtonLabel?: string;
}

/**
 * UserCredentialsForm component.
 * @param {UserCredentialsFormProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export const UserCredentialsForm: React.FC<UserCredentialsFormProps> = ({
  onSubmit,
  isPending,
  isError,
  error,
  submitButtonText,
  submitButtonLabel = "login-button",
}) => {
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

  return (
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
          onClick={(event) => {
            event.preventDefault();
            onSubmit(username, password);
          }}
          isBlock
          isDisabled={isPending}
        >
          {isPending ? <Spinner size="md" /> : <Text>{submitButtonText}</Text>}
        </Button>
      </ActionGroup>
    </Form>
  );
};
