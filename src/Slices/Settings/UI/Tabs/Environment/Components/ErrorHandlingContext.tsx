import React, { createContext, useState } from "react";

/**
 * ErrorHandlingContext component for the EnvironmentSettings component
 * @returns {React.FC<React.PropsWithChildren<unknown>>} The ErrorHandlingContext component
 */
export const ErrorHandlingContext = createContext<{
  error: string | null;
  setError: (error: string | null) => void;
}>({
  error: null,
  setError: () => {},
});

/**
 * ErrorHandlingProvider component for the EnvironmentSettings component
 * @returns {React.FC<React.PropsWithChildren<unknown>>} The ErrorHandlingProvider component
 */
export const ErrorHandlingProvider: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <ErrorHandlingContext.Provider value={{ error, setError }}>
      {children}
    </ErrorHandlingContext.Provider>
  );
};
