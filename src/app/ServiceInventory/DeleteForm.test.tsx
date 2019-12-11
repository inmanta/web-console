import { DeleteForm } from "./DeleteForm";
import React from "react";
import { mount } from "enzyme";
import { IRequestParams } from "@app/utils/fetchInmantaApi";


describe('Delete Form', () => {
  const dummyFunction = () => { return; };
  const requestParams: IRequestParams = { isEnvironmentIdRequired: true, environmentId: "envId1", urlEndpoint: "api/delete/instance", setErrorMessage: dummyFunction };
  beforeEach(() => {
    fetchMock.resetMocks();
  });
  it('Closes modal when cancelled', () => {
    let modalClosed = false;
    const wrapper = mount(<DeleteForm requestParams={requestParams} closeModal={() => modalClosed = true} />);
    const button = wrapper.find('.pf-m-secondary');
    button.simulate('click');
    expect(modalClosed).toBeTruthy();
    expect(fetchMock.mock.calls).toHaveLength(0);
  });
  it('Calls delete on provided endpoint when submitted', () => {
    const wrapper = mount(<DeleteForm requestParams={requestParams} closeModal={dummyFunction} />);
    const button = wrapper.find('.pf-m-primary');
    button.simulate('click');
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][1].method).toEqual("DELETE");
  });
});