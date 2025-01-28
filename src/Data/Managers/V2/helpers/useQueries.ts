import { useContext } from "react";
import { DependencyContext, PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

/**
 * Custom hook to perform a GET request.
 *
 * @param {Object} [options] - Optional configuration for the GET request.
 * @param {string} [options.message] - Optional message to include in the request headers.
 *
 * This hook constructs the base URL and headers, and provides a function to perform a GET request to the specified path.
 *
 * @returns {Function<ResponseData>} A function that performs a GET request and returns the response data.
 *
 * @template ResponseData - The type of the response data.
 */
export const useGet = (options?: {
  message?: string;
}): (<ResponseData>(path: string) => Promise<ResponseData>) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  return async <ResponseData>(path: string): Promise<ResponseData> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers,
      });

      await handleErrors(response);

      return response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
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
 * @returns {Function<Promise<ResponseData>>} A function that performs a GET request and returns the response data.
 *
 * @template ResponseData - The type of the response data.
 */
export const useGetWithoutEnv = (options?: {
  message?: string;
}): (<ResponseData>(path: string) => Promise<ResponseData>) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async <ResponseData>(path: string): Promise<ResponseData> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        headers,
      });

      await handleErrors(response);

      return response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
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
 * @returns {Function<Promise<ResponseData>>} - A function that performs a POST request.
 *
 * @template ResponseData - The expected response data type.
 * @template Body - The type of the request body.
 */
export const usePost = (options?: {
  message?: string;
}): (<ResponseData, Body>(
  path: string,
  body: Body,
) => Promise<ResponseData>) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  return async <ResponseData, Body>(
    path: string,
    body: Body,
  ): Promise<ResponseData> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response);

      return response.json();
    } catch (error) {
      console.error("Error posting data:", error);
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
 * @returns {Function<Promise<ResponseData>>} - A function that performs a POST request.
 *
 * @template ResponseData - The expected response data type.
 * @template Body - The type of the request body.
 */
export const usePostWithoutEnv = (options?: {
  message?: string;
}): (<ResponseData, Body>(
  path: string,
  body: Body,
) => Promise<ResponseData>) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async <ResponseData, Body>(
    path: string,
    body: Body,
  ): Promise<ResponseData> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response);

      return response.json();
    } catch (error) {
      console.error("Error posting data:", error);
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
 * @returns {Function<Promise<ResponseData>>} - A function that performs a PUT request.
 *
 * @template ResponseData - The expected response data type.
 * @template Body - The type of the request body.
 */
export const usePut = (options?: {
  message?: string;
}): (<ResponseData, Body>(
  path: string,
  body: Body,
) => Promise<ResponseData>) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  return async <ResponseData, Body>(
    path: string,
    body: Body,
  ): Promise<ResponseData> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response);

      return response.json();
    } catch (error) {
      console.error("Error putting data:", error);
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
 * @returns {Function<Promise<ResponseData>>} - A function that performs a PUT request.
 *
 * @template ResponseData - The expected response data type.
 * @template Body - The type of the request body.
 */
export const usePutWithoutEnv = (options?: {
  message?: string;
}): (<ResponseData, Body>(
  path: string,
  body: Body,
) => Promise<ResponseData>) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async <ResponseData, Body>(
    path: string,
    body: Body,
  ): Promise<ResponseData> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response);

      return response.json();
    } catch (error) {
      console.error("Error putting data:", error);
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
 * @returns {Function<Promise<ResponseData>>} - A function that performs a PATCH request.
 *
 * @template ResponseData - The expected response data type.
 * @template Body - The type of the request body.
 */
export const usePatch = (options?: {
  message?: string;
}): (<ResponseData, Body>(
  path: string,
  body: Body,
) => Promise<ResponseData>) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ env, message: options?.message });

  return async <ResponseData, Body>(
    path: string,
    body: Body,
  ): Promise<ResponseData> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response);

      return response.json();
    } catch (error) {
      console.error("Error patching data:", error);
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
 * @returns {Function<Promise<ResponseData>>} - A function that performs a PATCH request.
 *
 * @template ResponseData - The expected response data type.
 * @template Body - The type of the request body.
 */
export const usePatchWithoutEnv = (options?: {
  message?: string;
}): (<ResponseData, Body>(
  path: string,
  body: Body,
) => Promise<ResponseData>) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async <ResponseData, Body>(
    path: string,
    body: Body,
  ): Promise<ResponseData> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });

      await handleErrors(response);

      return response.json();
    } catch (error) {
      console.error("Error patching data:", error);
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
 * @returns {Function<Promise<ResponseData>>} A function that performs a DELETE request and returns the response data.
 *
 * @template ResponseData - The type of the response data.
 */
export const useDelete = (options?: {
  message?: string;
}): (<ResponseData>(path: string) => Promise<ResponseData>) => {
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
    headers.append("message", options.message);
  }

  return async <ResponseData>(path: string): Promise<ResponseData> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "DELETE",
        headers,
      });

      await handleErrors(response);

      return response.json();
    } catch (error) {
      console.error("Error deleting data:", error);
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
 * @returns {Function<Promise<ResponseData>>} A function that performs a DELETE request and returns the response data.
 *
 * @template ResponseData - The type of the response data.
 */
export const useDeleteWithoutEnv = (options?: {
  message?: string;
}): (<ResponseData>(path: string) => Promise<ResponseData>) => {
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders({ message: options?.message });

  return async <ResponseData>(path: string): Promise<ResponseData> => {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "DELETE",
        headers,
      });

      await handleErrors(response);

      return response.json();
    } catch (error) {
      console.error("Error deleting data:", error);
      throw error;
    }
  };
};
