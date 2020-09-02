export interface IRequestParams {
  urlEndpoint: string;
  data?: any;
  dispatch?: (data) => any;
  isEnvironmentIdRequired: boolean;
  environmentId: string | undefined;
  method?: string;
  setErrorMessage: React.Dispatch<string>;
  keycloak?: Keycloak.KeycloakInstance
}

function getAuthorizationHeader(keycloak?: Keycloak.KeycloakInstance) {
  if (keycloak && keycloak.token) {
    return { 'Authorization': `Bearer ${keycloak.token}` };
  }
  return {};
}

function extendHeadersWithAuth(headers, keycloak) {
  const authorizationHeader = getAuthorizationHeader(keycloak);
  if (authorizationHeader) {
    headers = { ...headers, ...authorizationHeader };
  }
  return headers;
}

export async function fetchInmantaApi(requestParams: IRequestParams) {
  try {
    let json;
    const baseUrl = process.env.API_BASEURL ? process.env.API_BASEURL : '';
    const fullEndpointPath = `${baseUrl}${requestParams.urlEndpoint}`;
    if (!requestParams.method || requestParams.method === 'GET') {
      json = await doFetch(fullEndpointPath, requestParams.isEnvironmentIdRequired, requestParams.environmentId, requestParams.keycloak);
    } else {
      json = await postWithFetchApi(fullEndpointPath, requestParams.environmentId, requestParams.method, requestParams.data, requestParams.keycloak);
    }

    if (requestParams.dispatch) {
      if (json) {
        requestParams.dispatch(json.data);
      } else if (requestParams.method && requestParams.method !== "GET") {
        // If there's no body, but a state update should be dispatched, do it based on the request parameters (e.g., for a DELETE)
        requestParams.dispatch(requestParams);
      } 
    }
    requestParams.setErrorMessage('');
    return json;
  }
  catch (error) {
    if (error.message) {
      requestParams.setErrorMessage(error.message);
    } else {
      requestParams.setErrorMessage('Request failed');
    }
  }
}

async function doFetch(urlEndpoint, isEnvironmentIdRequired, environmentId, keycloak) {
  let result: Response | undefined;
  if (isEnvironmentIdRequired && environmentId) {
    const headers = extendHeadersWithAuth({
      'X-Inmanta-Tid': environmentId
    }, keycloak);

    result = await fetch(`${urlEndpoint}`, {
      headers
    });
  } else if (!isEnvironmentIdRequired) {
    result = await fetch(`${urlEndpoint}`, { headers: extendHeadersWithAuth({}, keycloak) });
  }
  if (result) {
    if (!result.ok) {
      let errorMessage = '';
      if (keycloak && (result.status === 401 || result.status === 403)) {
        errorMessage = 'Authorization failed, please log in'
        keycloak.clearToken();
      }
      throw Error(`The following error occured while fetching data: ${result.status} ${result.statusText} ${errorMessage}`);
    }
    return result.json();
  }
}

async function postWithFetchApi(urlEndpoint, environmentId, method = "POST", data = '', keycloak) {
  let result: Response | undefined;
  if (environmentId) {
    let headers = {
      'Content-Type': 'application/json',
      'X-Inmanta-Tid': environmentId,
    };
    headers = extendHeadersWithAuth(headers, keycloak);

    const requestOptions: RequestInit = {
      headers,
      method,
    };
    if (data) {
      requestOptions.body = JSON.stringify(data);
    }
    result = await fetch(`${urlEndpoint}`, requestOptions);
  }
  if (result) {
    if (!result.ok) {
      let errorMessage = await result.json();
      errorMessage = errorMessage.message.replace(/\n/g, " ");
      if (keycloak && (result.status === 401 || result.status === 403)) {
        errorMessage += ' Authorization failed, please log in'
        keycloak.clearToken();
      }
      throw Error(`The following error occured while communicating with the server: ${result.status} ${result.statusText} ${errorMessage ? JSON.stringify(errorMessage) : ''}`);
    }
    if (result.bodyUsed) {
      return result.json();
    }
  }
}
