import React from "react";
import {
  Avatar,
  DropdownItem,
  PageHeaderToolsGroup,
  TextContent,
} from "@patternfly/react-core";
import { AngleDownIcon } from "@patternfly/react-icons";
import Keycloak from "keycloak-js";
import { IconDropdown } from "./IconDropdown";
/* eslint-disable-next-line import/no-unresolved */
import AvatarImg from "!url-loader!@assets/images/img_avatar.svg";

interface Props {
  keycloak: Keycloak | undefined;
}

export const Profile: React.FC<Props> = ({ keycloak }) => (
  <PageHeaderToolsGroup>
    <Login keycloak={keycloak} />
    <IconDropdown
      icon={<AngleDownIcon />}
      dropdownItems={[
        <DropdownItem
          key="action2"
          component="button"
          onClick={keycloak && (() => keycloak.logout())}
        >
          Logout
        </DropdownItem>,
      ]}
    />
    <Avatar src={AvatarImg} alt="Avatar image" />
  </PageHeaderToolsGroup>
);

const Login: React.FC<Props> = ({ keycloak }) => {
  const [name, setName] = React.useState("inmanta2");
  if (keycloak && keycloak.profile && keycloak.profile.username !== name) {
    setName(keycloak.profile.username as string);
  }

  return <TextContent>{name}</TextContent>;
};
