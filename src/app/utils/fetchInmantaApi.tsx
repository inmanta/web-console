export interface IRequestParams {
  urlEndpoint: string;
  data?: any;
  dispatch?: (data) => any;
  isEnvironmentIdRequired: boolean;
  environmentId: string | undefined;
  method?: string;
  setErrorMessage: React.Dispatch<string>;
}

export async function fetchInmantaApi(requestParams: IRequestParams) {
  try {
    let json;
    const baseUrl = process.env.API_BASEURL ? process.env.API_BASEURL : '';
    const fullEndpointPath = `${baseUrl}${requestParams.urlEndpoint}`;
    if (!requestParams.method || requestParams.method === 'GET') {
      json = await doFetch(fullEndpointPath, requestParams.isEnvironmentIdRequired, requestParams.environmentId);
    } else {
      json = await postWithFetchApi(requestParams.urlEndpoint, requestParams.environmentId, requestParams.method, requestParams.data);
    }

    if (json && requestParams.dispatch) {
      requestParams.dispatch(json.data);
    }
    requestParams.setErrorMessage('');
    return json;
  }
  catch (error) {
    requestParams.setErrorMessage(error.message);
  }
}

async function doFetch(urlEndpoint, isEnvironmentIdRequired, environmentId) {
  let result: Response | undefined;
  if (isEnvironmentIdRequired && environmentId) {
    result = await fetch(`${urlEndpoint}`, {
      headers: {
        'X-Inmanta-Tid': environmentId
      }
    });
  } else if (!isEnvironmentIdRequired) {
    result = await fetch(`${urlEndpoint}`);
  }
  if (result) {
    if (!result.ok) {
      throw Error(`The following error occured while fetching data: ${result.statusText}`);
    }
    return result.json();
  }
}

async function postWithFetchApi(urlEndpoint, environmentId, method = "POST", data = '') {
  let result: Response | undefined;
  if (environmentId) {
    const requestOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'X-Inmanta-Tid': environmentId,
      },
      method,
    };
    if (data) {
      requestOptions.body = JSON.stringify(data);
    }
    result = await fetch(`$${urlEndpoint}`, requestOptions);
  }
  if (result) {
    if (!result.ok) {
      const errorMessage = await result.json();
      throw Error(`The following error occured while communicating with the server: ${result.statusText} ${errorMessage ? JSON.stringify(errorMessage) : ''}`);
    }
  }
}
