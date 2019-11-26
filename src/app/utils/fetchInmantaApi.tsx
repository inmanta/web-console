export interface IRequestParams {
  urlEndpoint: string;
  dispatch: (data) => any;
  isEnvironmentIdRequired: boolean;
  environmentId: string | undefined;
  setErrorMessage: React.Dispatch<string>;
}

export async function fetchInmantaApi(requestParams: IRequestParams) {
  try {
    const json = await doFetch(requestParams.urlEndpoint, requestParams.isEnvironmentIdRequired, requestParams.environmentId);
    if (json) {
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
  const baseUrl = process.env.API_BASEURL ? process.env.API_BASEURL : '';
  if (isEnvironmentIdRequired && environmentId) {
    result = await fetch(`${baseUrl}${urlEndpoint}`, {
      headers: {
        'X-Inmanta-Tid': environmentId
      }
    });
  } else if (!isEnvironmentIdRequired) {
    result = await fetch(`${baseUrl}${urlEndpoint}`);
  }
  if (result) {
    if (!result.ok) {
      throw Error(`The following error occured while fetching data: ${result.statusText}`);
    }
    return result.json();
  }
}
