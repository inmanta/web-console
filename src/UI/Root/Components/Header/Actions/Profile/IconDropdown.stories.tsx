import React from "react";
import { DropdownItem } from "@patternfly/react-core";
import { AngleDownIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { IconDropdown } from "./IconDropdown";

export default {
  title: "IconDropdown",
  component: IconDropdown,
};

export const Default = () => (
  <Container>
    <IconDropdown
      icon={AngleDownIcon}
      dropdownItems={[
        <DropdownItem
          key="action2"
          component="button"
          onClick={() => {
            console.log("click");
          }}
        >
          Logout
        </DropdownItem>,
      ]}
    />
  </Container>
);

const Container = styled.div`
  width: 100px;
  display: flex;
  justify-content: flex-end;
`;
