import { useHistory, useLocation } from "react-router-dom";
import { RouteKind } from "@/Core";

export interface Location {
  pathname: string;
  search: string;
  hash: string;
}

export interface History {
  replace(to: string): void;
}

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
  history: History
) => ReturnValue;

type ProvidedHandler<ConfigType, ReturnValue> = (
  config: ConfigType
) => ReturnValue;

export const provide = <ConfigType, ReturnValue>(
  handler: Handler<ConfigType, ReturnValue>
): ProvidedHandler<ConfigType, ReturnValue> => {
  return (config) => {
    const location = useLocation();
    const history = useHistory();
    return handler(config, location, history);
  };
};
