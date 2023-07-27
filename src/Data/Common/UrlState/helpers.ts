import { useNavigate, useLocation } from "react-router-dom";
import { RouteKind } from "@/Core";

export interface Location {
  pathname: string;
  search: string;
  hash: string;
}

export type Replace = (path: string) => void;

export type Update<Data> = (data: Data) => void;

export interface StateConfig<Data> {
  default: Data;
  key: string;
  route: RouteKind;
  serialize: (data: Data) => string | Data;
  parse: (value: unknown) => Data | undefined;
  equals: (a: Data, b: Data) => boolean;
}

type Handler<ConfigType, ReturnValue> = (
  config: ConfigType,
  location: Location,
  replace: Replace,
) => ReturnValue;

type ProvidedHandler<ConfigType, ReturnValue> = (
  config: ConfigType,
) => ReturnValue;

export const provide = <ConfigType, ReturnValue>(
  handler: Handler<ConfigType, ReturnValue>,
): ProvidedHandler<ConfigType, ReturnValue> => {
  return (config) => {
    const location = useLocation();
    const navigate = useNavigate();
    return handler(config, location, (path) =>
      navigate(path, { replace: true }),
    );
  };
};
