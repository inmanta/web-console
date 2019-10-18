import React from 'react';
import { App } from '@app/index';
import { mount } from 'enzyme';
import Keycloak from 'keycloak-js';
import { wait } from '@testing-library/react';

describe('Navigation', () => {
  let keycloak: Keycloak.KeycloakInstance;
  beforeEach(() => {
    keycloak = Keycloak();
  });

  it('should render nav groups', () => {
    const wrapper = mount(<App keycloak={keycloak} />);
    const nav = wrapper.find('#nav-primary-simple');
    wait();
    expect(nav.find('.pf-c-nav__section-title')).toHaveLength(2);
  });

  it('should navigate when clicking on link', () => {
    const wrapper = mount(<App keycloak={keycloak} />);
    const nav = wrapper.find('#nav-primary-simple');
    const serviceCatalogEntry = nav.find('.pf-c-nav__link').first();
    serviceCatalogEntry.simulate('click');
    wait();
    expect(serviceCatalogEntry.getElement().props.activeClassName)
      .toEqual('pf-m-current');
  });

});
