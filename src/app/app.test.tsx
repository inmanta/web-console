import React from 'react';
import { App } from '@app/index';
import { mount } from 'enzyme';
import { Button } from '@patternfly/react-core';
import Keycloak from 'keycloak-js';
import { wait } from '@testing-library/react';



describe('App tests', () => {
  fetchMock.mockResponse(JSON.stringify({}));
  let keycloak: Keycloak.KeycloakInstance;
  beforeEach(() => {
    keycloak = Keycloak();
  });

  it('should render a nav-toggle button', () => {
    const wrapper = mount(<App keycloak={keycloak} shouldUseAuth={false} />);
    const button = wrapper.find(Button);
    wait();
    expect(button.exists()).toBe(true);
  });

  it('should hide the sidebar when clicking the nav-toggle button', () => {
    const wrapper = mount(<App keycloak={keycloak} shouldUseAuth={false} />);
    const button = wrapper.find('#nav-toggle').hostNodes();
    expect(wrapper.find('#page-sidebar').hasClass('pf-m-expanded'));
    button.simulate('click');
    wait();
    expect(wrapper.find('#page-sidebar').hasClass('pf-m-collapsed'));
  });
});
