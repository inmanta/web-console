import { CheckSquareIcon, TimesCircleIcon } from "@patternfly/react-icons";
import React from "react";
import { shallow } from "enzyme";
import { getStatusIcon } from "./ResourceTable";

describe('Resource Table', () => {
  it.each`
  resourceState | iconType
  ${'deployed'} | ${CheckSquareIcon}
  ${'failed'} | ${TimesCircleIcon}
  ${'deploying'} | ${React.Fragment}
  `('Should choose icon $IconType for state $resourceState', ({ resourceState, iconType }) => {
    const Icon = getStatusIcon(resourceState);
    const wrapper = shallow(<Icon />);
    expect(wrapper.type()).toEqual(iconType);
  });

});