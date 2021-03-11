import React from "react";
import { mount } from "enzyme";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from "@patternfly/react-icons";
import { InstanceState } from "./InstanceState";

describe("InstanceState shows ", () => {
  it.each`
    icon                             | label
    ${(<CheckCircleIcon />)}         | ${"success"}
    ${(<ExclamationCircleIcon />)}   | ${"danger"}
    ${(<ExclamationTriangleIcon />)} | ${"warning"}
    ${(<InfoCircleIcon />)}          | ${"info"}
    ${(<InfoCircleIcon />)}          | ${undefined}
  `("icon $icon for label $label", ({ icon, label }) => {
    const wrapper = mount(<InstanceState name="up" label={label} />);
    expect(wrapper.contains(icon)).toBeTruthy();
  });
});
