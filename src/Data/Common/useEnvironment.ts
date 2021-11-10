import { useLocation } from "react-router-dom";

export const useEnvironment = (): string => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const env = params.get("env");
  if (env === null) return "";
  return env;
};
