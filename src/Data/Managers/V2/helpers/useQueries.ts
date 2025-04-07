import { useContext } from 'react';
import { DependencyContext, PrimaryBaseUrlManager } from '@/UI';
import { useFetchHelpers } from '../helpers';

/**
 * Custom hook to perform a GET request.
 *
 * @param {Object} [options] - Optional configuration for the GET request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a GET request to the specified path.
 *
 * @returns {Function(path: string): Promise<Response>} A function that performs a GET request and returns the response data.
 *
 * @template Response - The type of the response data.
 */
export const useGet = (options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  return async <Response>(path: string): Promise<Response> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers,
      });

      await handleErrors(response);

      return response.json();
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Custom hook to perform a GET request.
 *
 *  @param {Object} [options] - Optional configuration for the GET request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a GET request to the specified path.
 * In comparison to useGet, this hook does not use the environment context, so it can be used only to perform requests that are environment-agnostic.
 *
 * @returns {Function(path: string): Promise<Response>} A function that performs a GET request and returns the response data.
 *
 * @template Response - The type of the response data.
 */
export const useGetWithoutEnv = (options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async <Response>(path: string): Promise<Response> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers,
      });

      await handleErrors(response);

      return response.json();
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Custom hook to perform a GET Zip request.
 *
 * @param {Object} [options] - Optional configuration for the GET request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a GET request to the specified path.
 *
 * @returns {Function<Blob>} A function that performs a GET zip request and returns the response blob.
 */
export const useGetZip = (options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  return async (path: string): Promise<Blob> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers,
      });

      await handleErrors(response);

      return response.blob();
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
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async (path: string): Promise<Blob> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers,
      });

      await handleErrors(response);

      return response.blob();
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Custom hook to create a POST request function.
 *
 * @param {Object} [options] - Optional configuration for the POST request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * @returns {Function(path: string, body: Body): Promise<Response>} - A function that performs a POST request.
 *
 * @template Body - The type of the request body.
 */
export const usePost = (options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  return async <Body>(path: string, body: Body) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response);

      const text = await response.text();

      if (text) {
        return JSON.parse(text);
      }
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Custom hook to create a POST request function.
 *
 * @param {Object} [options] - Optional configuration for the POST request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a POST request to the specified path.
 * In comparison to usePost, this hook does not use the environment context, so it can be used only to perform requests that are environment-agnostic.
 *
 * @returns {Function(path: string, body: Body): Promise<Response>} - A function that performs a POST request.
 *
 * @template Body - The type of the request body.
 */
export const usePostWithoutEnv = (options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async <Body>(path: string, body: Body) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response);

      const text = await response.text();

      if (text) {
        return JSON.parse(text);
      }

      return;
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Custom hook to create a PUT request function.
 *
 * @param {Object} [options] - Optional configuration for the PUT request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a PUT request to the specified path.
 *
 * @returns {Function(path: string, body: Body): Promise<Response>} - A function that performs a PUT request.
 *
 * @template Body - The type of the request body.
 */
export const usePut = (options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  return async <Body>(path: string, body: Body) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response);

      const text = await response.text();

      if (text) {
        return JSON.parse(text);
      }
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Custom hook to create a PUT request function.
 *
 * @param {Object} [options] - Optional configuration for the PUT request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a PUT request to the specified path.
 * In comparison to usePut, this hook does not use the environment context, so it can be used only to perform requests that are environment-agnostic.
 *
 * @returns {Function(path: string, body: Body): Promise<Response>} - A function that performs a PUT request.
 *
 * @template Body - The type of the request body.
 */
export const usePutWithoutEnv = (options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async <Body>(path: string, body: Body) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response);

      const text = await response.text();

      if (text) {
        return JSON.parse(text);
      }
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
 *
 * @returns {Function(path: string, body: Body): Promise<Response>} - A function that performs a PATCH request.
 *
 * @template Body - The type of the request body.
 */
export const usePatch = (options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  return async <Body>(path: string, body: Body) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response);

      const text = await response.text();

      if (text) {
        return JSON.parse(text);
      }
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
 * @returns {Function(path: string, body: Body): Promise<Response>} - A function that performs a PATCH request.
 *
 * @template Body - The type of the request body.
 */
export const usePatchWithoutEnv = (options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async <Body>(path: string, body: Body) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response);

      const text = await response.text();

      if (text) {
        return JSON.parse(text);
      }
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
 *
 * @returns {Function} A function that performs a DELETE request and returns the response data.
 */
export const useDelete = (options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  if (options?.message) {
    headers.append('message', options.message);
  }

  return async (path: string) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'DELETE',
        headers,
      });

      await handleErrors(response);

      const text = await response.text();

      if (text) {
        return JSON.parse(text);
      }
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
 * @returns {Function} A function that performs a DELETE request and returns the response data.
 */
export const useDeleteWithoutEnv = (options?: { message?: string }) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async (path: string) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'DELETE',
        headers,
      });

      await handleErrors(response);
      const text = await response.text();

      if (text) {
        return JSON.parse(text);
      }
    } catch (error) {
      throw error;
    }
  };
};

/**
 * Custom hook to perform a HEAD request.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a HEAD request to the specified path.
 * The hook is environment-agnostic and can be used to check resource existence or get response headers without fetching the body.
 *
 * @returns {Function} A function that performs a HEAD request and returns the HTTP status code.
 * If the request fails, it returns 500 as a status code.
 *
 * @example
 * const head = useHead();
 * const status = await head('/api/resource');
 * if (status === 200) {
 *   // Resource exists
 * }
 */

export const useHead = () => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { createHeaders } = useFetchHelpers();

  return async (path: string) => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'HEAD',
        headers: createHeaders(),
      });

      return response;
    } catch (error) {
      throw error;
    }
  };
};
