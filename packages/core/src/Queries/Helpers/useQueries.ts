import { PrimaryBaseUrlManager } from "@inmanta/web-console-core/Routing";
import { parseJsonResponse, parseRequiredJsonResponse, useFetchHelpers } from "./useFetchHelpers";

/**
 * Options of the POST and PUT request hooks.
 */
interface RequestWithBodyOptions {
  /** Message to include in the request headers. */
  message?: string;

  /** Whether the request rejects when the server sends an empty response body, for callers that read the response. */
  isResponseBodyRequired?: boolean;
}

/**
 * A POST or PUT request that resolves to the response body, or undefined when the body is empty.
 */
type RequestWithOptionalResponseBody = <RequestBody, ResponseBody = void>(
  path: string,
  body: RequestBody
) => Promise<ResponseBody | undefined>;

/**
 * A POST or PUT request that resolves to the response body, and rejects when the body is empty.
 */
type RequestWithRequiredResponseBody = <RequestBody, ResponseBody>(
  path: string,
  body: RequestBody
) => Promise<ResponseBody>;

/**
 * Custom hook to perform a GET request.
 *
 * @param {string} env - The environment Id to be used in the request headers.
 * @param {Object} [options] - Optional configuration for the GET request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a GET request to the specified path.
 *
 * @returns {Function(path: string): Promise<ResponseBody>} A function that performs a GET request and returns the response data. It rejects when the response body is empty.
 *
 * @template ResponseBody - The type of the response data.
 */
export const useGet = (env: string, options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const baseUrl = baseUrlManager.getBaseUrl();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  return async <ResponseBody>(path: string): Promise<ResponseBody> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers,
      });

      await handleErrors(response, { method: "GET", path });

      return parseRequiredJsonResponse<ResponseBody>(response);
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Custom hook to perform a GET request with an optional, assignment  of environment Id for a header.
 *
 * @param {string} [env] - The environment Id to be used in the request headers.
 * @param {Object} [options] - Optional configuration for the GET request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a GET request to the specified path.
 *
 * @returns {Function(path: string): Promise<ResponseBody>} A function that performs a GET request and returns the response data. It rejects when the response body is empty.
 *
 * @template ResponseBody - The type of the response data.
 */
export const useGetWithOptionalEnv = (env?: string, options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const baseUrl = baseUrlManager.getBaseUrl();

  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  return async <ResponseBody>(path: string): Promise<ResponseBody> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers,
      });

      await handleErrors(response, { method: "GET", path });

      return parseRequiredJsonResponse<ResponseBody>(response);
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Custom hook to perform a GET request.
 *
 * @param {Object} [options] - Optional configuration for the GET request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a GET request to the specified path.
 * In comparison to useGet, this hook does not use the environment context, so it can be used only to perform requests that are environment-agnostic.
 *
 * @returns {Function(path: string): Promise<ResponseBody>} A function that performs a GET request and returns the response data. It rejects when the response body is empty.
 *
 * @template ResponseBody - The type of the response data.
 */
export const useGetWithoutEnv = (options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const baseUrl = baseUrlManager.getBaseUrl();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async <ResponseBody>(path: string): Promise<ResponseBody> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers,
      });

      await handleErrors(response, { method: "GET", path });

      return parseRequiredJsonResponse<ResponseBody>(response);
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Custom hook to perform a GET zip request.
 *
 *  @param {Object} [options] - Optional configuration for the GET request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a GET request to the specified path.
 * In comparison to useGet, this hook does not use the environment context, so it can be used only to perform requests that are environment-agnostic.
 *
 * @returns {Function(path: string): Promise<Blob>} A function that performs a GET zip  request and returns the response blob.
 */
export const useGetZipWithoutEnv = (options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const baseUrl = baseUrlManager.getBaseUrl();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async (path: string): Promise<Blob> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers,
      });

      await handleErrors(response, { method: "GET", path });

      return response.blob();
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Custom hook to create a POST request function.
 *
 * @param {string} env - The environment Id to be used in the request headers.
 * @param {RequestWithBodyOptions} [options] - Optional configuration for the POST request.
 *
 * @returns {Function(path: string, body: RequestBody): Promise<ResponseBody | undefined>} - A function that performs a POST request and returns the response data. With `isResponseBodyRequired` it rejects on an empty response body, otherwise it returns undefined for it.
 *
 * @template RequestBody - The type of the request body.
 * @template ResponseBody - The type of the response data. Defaults to void for callers that don't read the response.
 */
export function usePost(
  env: string,
  options: RequestWithBodyOptions & { isResponseBodyRequired: true }
): RequestWithRequiredResponseBody;
export function usePost(
  env: string,
  options?: RequestWithBodyOptions
): RequestWithOptionalResponseBody;
export function usePost(env: string, options?: RequestWithBodyOptions) {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const baseUrl = baseUrlManager.getBaseUrl();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  return async <RequestBody, ResponseBody = void>(path: string, body: RequestBody) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response, { method: "POST", path });

      return options?.isResponseBodyRequired
        ? parseRequiredJsonResponse<ResponseBody>(response)
        : parseJsonResponse<ResponseBody>(response);
    } catch (error) {
      throw error;
    }
  };
}

/**
 * Custom hook to create a POST request function.
 *
 * @param {RequestWithBodyOptions} [options] - Optional configuration for the POST request.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a POST request to the specified path.
 * In comparison to usePost, this hook does not use the environment context, so it can be used only to perform requests that are environment-agnostic.
 *
 * @returns {Function(path: string, body: RequestBody): Promise<ResponseBody | undefined>} - A function that performs a POST request and returns the response data. With `isResponseBodyRequired` it rejects on an empty response body, otherwise it returns undefined for it.
 *
 * @template RequestBody - The type of the request body.
 * @template ResponseBody - The type of the response data. Defaults to void for callers that don't read the response.
 */
export function usePostWithoutEnv(
  options: RequestWithBodyOptions & { isResponseBodyRequired: true }
): RequestWithRequiredResponseBody;
export function usePostWithoutEnv(
  options?: RequestWithBodyOptions
): RequestWithOptionalResponseBody;
export function usePostWithoutEnv(options?: RequestWithBodyOptions) {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const baseUrl = baseUrlManager.getBaseUrl();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async <RequestBody, ResponseBody = void>(path: string, body: RequestBody) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response, { method: "POST", path });

      return options?.isResponseBodyRequired
        ? parseRequiredJsonResponse<ResponseBody>(response)
        : parseJsonResponse<ResponseBody>(response);
    } catch (error) {
      throw error;
    }
  };
}

/**
 * Custom hook to create a PUT request function.
 *
 * @param {string} env - The environment Id to be used in the request headers.
 * @param {RequestWithBodyOptions} [options] - Optional configuration for the PUT request.
 *
 * @returns {Function(path: string, body: RequestBody): Promise<ResponseBody | undefined>} - A function that performs a PUT request and returns the response data. With `isResponseBodyRequired` it rejects on an empty response body, otherwise it returns undefined for it.
 *
 * @template RequestBody - The type of the request body.
 * @template ResponseBody - The type of the response data. Defaults to void for callers that don't read the response.
 */
export function usePut(
  env: string,
  options: RequestWithBodyOptions & { isResponseBodyRequired: true }
): RequestWithRequiredResponseBody;
export function usePut(
  env: string,
  options?: RequestWithBodyOptions
): RequestWithOptionalResponseBody;
export function usePut(env: string, options?: RequestWithBodyOptions) {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const baseUrl = baseUrlManager.getBaseUrl();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  return async <RequestBody, ResponseBody = void>(path: string, body: RequestBody) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response, { method: "PUT", path });

      return options?.isResponseBodyRequired
        ? parseRequiredJsonResponse<ResponseBody>(response)
        : parseJsonResponse<ResponseBody>(response);
    } catch (error) {
      throw error;
    }
  };
}

/**
 * Custom hook to create a PUT request function.
 *
 * @param {RequestWithBodyOptions} [options] - Optional configuration for the PUT request.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a PUT request to the specified path.
 * In comparison to usePut, this hook does not use the environment context, so it can be used only to perform requests that are environment-agnostic.
 *
 * @returns {Function(path: string, body: RequestBody): Promise<ResponseBody | undefined>} - A function that performs a PUT request and returns the response data. With `isResponseBodyRequired` it rejects on an empty response body, otherwise it returns undefined for it.
 *
 * @template RequestBody - The type of the request body.
 * @template ResponseBody - The type of the response data. Defaults to void for callers that don't read the response.
 */
export function usePutWithoutEnv(
  options: RequestWithBodyOptions & { isResponseBodyRequired: true }
): RequestWithRequiredResponseBody;
export function usePutWithoutEnv(options?: RequestWithBodyOptions): RequestWithOptionalResponseBody;
export function usePutWithoutEnv(options?: RequestWithBodyOptions) {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const baseUrl = baseUrlManager.getBaseUrl();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async <RequestBody, ResponseBody = void>(path: string, body: RequestBody) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response, { method: "PUT", path });

      return options?.isResponseBodyRequired
        ? parseRequiredJsonResponse<ResponseBody>(response)
        : parseJsonResponse<ResponseBody>(response);
    } catch (error) {
      throw error;
    }
  };
}

/**
 * Custom hook to create a PATCH request function.
 *
 * @param {string} env - The environment Id to be used in the request headers.
 * @param {Object} [options] - Optional configuration for the PATCH request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a PATCH request to the specified path.
 *
 * @returns {Function(path: string, body: RequestBody): Promise<ResponseBody | undefined>} - A function that performs a PATCH request and returns the response data, or undefined when the response body is empty.
 *
 * @template RequestBody - The type of the request body.
 * @template ResponseBody - The type of the response data. Defaults to void for callers that don't read the response.
 */
export const usePatch = (env: string, options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const baseUrl = baseUrlManager.getBaseUrl();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  return async <RequestBody, ResponseBody = void>(path: string, body: RequestBody) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response, { method: "PATCH", path });

      return parseJsonResponse<ResponseBody>(response);
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Custom hook to create a PATCH request function.
 *
 * @param {Object} [options] - Optional configuration for the PATCH request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a PATCH request to the specified path.
 * In comparison to usePatch, this hook does not use the environment context, so it can be used only to perform requests that are environment-agnostic.
 *
 * @returns {Function(path: string, body: RequestBody): Promise<ResponseBody | undefined>} - A function that performs a PATCH request and returns the response data, or undefined when the response body is empty.
 *
 * @template RequestBody - The type of the request body.
 * @template ResponseBody - The type of the response data. Defaults to void for callers that don't read the response.
 */
export const usePatchWithoutEnv = (options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const baseUrl = baseUrlManager.getBaseUrl();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async <RequestBody, ResponseBody = void>(path: string, body: RequestBody) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response, { method: "PATCH", path });

      return parseJsonResponse<ResponseBody>(response);
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Custom hook to perform a DELETE request.
 *
 * @param {string} env - The environment Id to be used in the request headers.
 * @param {Object} [options] - Optional configuration for the DELETE request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a DELETE request to the specified path.
 *
 * @returns {Function(path: string): Promise<ResponseBody | undefined>} A function that performs a DELETE request and returns the response data, or undefined when the response body is empty.
 *
 * @template ResponseBody - The type of the response data. Defaults to void for callers that don't read the response.
 */
export const useDelete = (env: string, options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const baseUrl = baseUrlManager.getBaseUrl();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  if (options?.message) {
    headers.append("message", options.message);
  }

  return async <ResponseBody = void>(path: string) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "DELETE",
        headers,
      });

      await handleErrors(response, { method: "DELETE", path });

      return parseJsonResponse<ResponseBody>(response);
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Custom hook to perform a DELETE request.
 *
 * @param {Object} [options] - Optional configuration for the DELETE request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a DELETE request to the specified path.
 * In comparison to useDelete, this hook does not use the environment context, so it can be used only to perform requests that are environment-agnostic.
 *
 * @returns {Function(path: string): Promise<ResponseBody | undefined>} A function that performs a DELETE request and returns the response data, or undefined when the response body is empty.
 *
 * @template ResponseBody - The type of the response data. Defaults to void for callers that don't read the response.
 */
export const useDeleteWithoutEnv = (options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const baseUrl = baseUrlManager.getBaseUrl();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async <ResponseBody = void>(path: string) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "DELETE",
        headers,
      });

      await handleErrors(response, { method: "DELETE", path });

      return parseJsonResponse<ResponseBody>(response);
    } catch (error) {
      throw error;
    }
  };
};
