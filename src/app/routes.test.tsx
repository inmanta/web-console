import React from 'react';
import { App } from '@app/index';
import { mount } from 'enzyme';

describe('Navigation', () => {

  it('should render nav groups', () => {
    const wrapper = mount(<App />);
    const nav = wrapper.find('#nav-primary-simple');
    expect(nav.find('.pf-c-nav__section-title')).toHaveLength(2);
  });

  it('should navigate when clicking on link', () => {
    const wrapper = mount(<App />);
    const nav = wrapper.find('#nav-primary-simple');
    const serviceCatalogEntry = nav.find('.pf-c-nav__link').first();
    serviceCatalogEntry.simulate('click');
    expect(serviceCatalogEntry.getElement().props['activeClassName'])
      .toEqual('pf-m-current');
  });

});
