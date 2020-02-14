import { fetchInmantaApi, IRequestParams } from "./fetchInmantaApi";

describe('Backend data fetching function', () => {
  const dummyDispatch = (data) => data;
  const dummyErrorSetter: React.Dispatch<string> = (message) => message;
  const defaultRequestParams: IRequestParams = { urlEndpoint: '/abc', isEnvironmentIdRequired: true, environmentId: 'env-id', dispatch: dummyDispatch, setErrorMessage: dummyErrorSetter };
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('On successful request', () => {
    beforeEach(() => {
      fetchMock.mockResponse(JSON.stringify({ data: { item: 'dummy' } }));
    });
    it('Should add custom header to request if required', async () => {
      await fetchInmantaApi(defaultRequestParams);
      expect(fetchMock.mock.calls[0][1]).toEqual({ headers: { 'X-Inmanta-Tid': 'env-id' } });
    });
    it('Should call dispatch function', async () => {
      let counter = 0;
      const dispatch = (data) => counter += 1;
      const requestParams: IRequestParams = { ...defaultRequestParams, dispatch };
      await fetchInmantaApi(requestParams);
      expect(counter).toBe(1);
    });
    it('Should pass result to dispatch function', async () => {
      const dispatch = (data) => expect(data).toEqual({ item: 'dummy' });
      const requestParams: IRequestParams = { ...defaultRequestParams, dispatch };
      await fetchInmantaApi(requestParams);
    });
    it('Should not fetch if environmentId is required but not set', async () => {
      const requestParams: IRequestParams = { ...defaultRequestParams, environmentId: undefined };
      const result = await fetchInmantaApi(requestParams);
      expect(result).toBeUndefined();
      expect(fetchMock.mock.calls).toHaveLength(0);
    });
    it('Should fetch if environmentId is not required', async () => {
      const requestParams: IRequestParams = { ...defaultRequestParams, isEnvironmentIdRequired: false, environmentId: undefined };
      const result = await fetchInmantaApi(requestParams);
      expect(result).toEqual({ data: { item: 'dummy' } });
    });
    it('Should not add custom header if not required', async () => {
      const requestParams: IRequestParams = { ...defaultRequestParams, isEnvironmentIdRequired: false };
      const result = await fetchInmantaApi(requestParams);
      expect(fetchMock.mock.calls[0]).toHaveLength(2);
      expect(fetchMock.mock.calls[0][1].headers).toEqual({});
    });
  });
  describe('On failed request', () => {
    it('Should set the error message correctly for http errors', async () => {
      fetchMock.mockResponse(JSON.stringify({}), { status: 400, statusText: 'Bad Request' });

      let errorMessage;
      const setErrorMessage: React.Dispatch<string> = (message) => { errorMessage = message };
      const requestParams: IRequestParams = { ...defaultRequestParams, setErrorMessage };
      await fetchInmantaApi(requestParams);
      expect(errorMessage.includes('Bad Request')).toBeTruthy();
    });
    it('Should set the error message correctly for connection errors', async () => {
      fetchMock.mockReject(new Error('Network error'));

      let errorMessage;
      const setErrorMessage: React.Dispatch<string> = (message) => { errorMessage = message };
      const requestParams: IRequestParams = { ...defaultRequestParams, setErrorMessage };
      await fetchInmantaApi(requestParams);
      expect(errorMessage.includes('Network error')).toBeTruthy();
    });
  });

  it('Should set content type and data on POST calls', async () => {
    const data = { attributes: { attribute1: "value" } };
    fetchMock.mockResponse(JSON.stringify({ data: { ...data, id: 'instanceId1' } }));
    await fetchInmantaApi({ ...defaultRequestParams, method: 'POST', data });
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][1]).toEqual({ headers: { 'X-Inmanta-Tid': 'env-id', 'Content-Type': 'application/json' }, method: 'POST', body: JSON.stringify(data) });
  });
  it('Should set content type and data on PATCH calls', async () => {
    const data = { attributes: { attribute1: "value" } };
    await fetchInmantaApi({ ...defaultRequestParams, method: 'PATCH', data });
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][1]).toEqual({ headers: { 'X-Inmanta-Tid': 'env-id', 'Content-Type': 'application/json' }, method: 'PATCH', body: JSON.stringify(data) });
  });
  it('Should set method correctly on DELETE calls', async () => {
    await fetchInmantaApi({ ...defaultRequestParams, method: 'DELETE' });
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][1]).toEqual({ headers: { 'X-Inmanta-Tid': 'env-id', 'Content-Type': 'application/json' }, method: 'DELETE' });
  });
  it('Should handle errors on server state modifying calls', async () => {
    fetchMock.mockResponse(JSON.stringify({}), { status: 400, statusText: 'Bad Request' });

    let errorMessage;
    const setErrorMessage: React.Dispatch<string> = (message) => { errorMessage = message };
    const requestParams: IRequestParams = { ...defaultRequestParams, setErrorMessage, method: 'DELETE' };
    await fetchInmantaApi(requestParams);
    expect(errorMessage.includes('Bad Request')).toBeTruthy();
  });
  it('Should add host to the url when configured', async () => {
    process.env.API_BASEURL = "http://localhost:8888/api";
    await fetchInmantaApi({ ...defaultRequestParams, method: 'DELETE' });
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(fetchMock.mock.calls[0][0]).toEqual("http://localhost:8888/api/abc");
  });
  describe('When keycloak is enabled', () => {
    const requestParamsWithKeycloak = { ...defaultRequestParams, keycloak: { token: "JWT token", clearToken: () => {return;} } as Keycloak.KeycloakInstance };
    it('Should add authorization header to GET requests', async () => {
      await fetchInmantaApi(requestParamsWithKeycloak);
      expect(fetchMock.mock.calls).toHaveLength(1);
      expect(fetchMock.mock.calls[0][1].headers).toEqual({ "Authorization": "Bearer JWT token", "X-Inmanta-Tid": "env-id" });
    });
    it('Should add authorization header to other requests', async () => {
      await fetchInmantaApi({ ...requestParamsWithKeycloak, method: 'POST' });
      expect(fetchMock.mock.calls).toHaveLength(1);
      expect(fetchMock.mock.calls[0][1].headers).toEqual({ "Authorization": "Bearer JWT token", "X-Inmanta-Tid": "env-id", "Content-Type": "application/json" });
    });
    it('Should add authorization header to GET requests without environment id', async () => {
      await fetchInmantaApi({ ...requestParamsWithKeycloak, isEnvironmentIdRequired: false });
      expect(fetchMock.mock.calls).toHaveLength(1);
      expect(fetchMock.mock.calls[0][1].headers).toEqual({ "Authorization": "Bearer JWT token" });
    });
    it('Should handle authorization errors on GET requests', async () => {
      fetchMock.mockResponse(JSON.stringify({}), { status: 403, statusText: 'Forbidden' });
      let errorMessage;
      const setErrorMessage: React.Dispatch<string> = (message) => { errorMessage = message };
      const requestParams: IRequestParams = { ...requestParamsWithKeycloak, setErrorMessage};
      await fetchInmantaApi(requestParams);
      expect(errorMessage.includes('Authorization failed')).toBeTruthy();
    });
    it('Should handle authorization errors on POST requests', async () => {
      fetchMock.mockResponse(JSON.stringify({}), { status: 403, statusText: 'Forbidden' });
      let errorMessage;
      const setErrorMessage: React.Dispatch<string> = (message) => { errorMessage = message };
      const requestParams: IRequestParams = { ...requestParamsWithKeycloak, setErrorMessage, method: 'POST'};
      await fetchInmantaApi(requestParams);
      expect(errorMessage.includes('Authorization failed')).toBeTruthy();
    });
  })


});