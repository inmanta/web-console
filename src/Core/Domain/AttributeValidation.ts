export type AttributeValidation =
  | EnumValidation
  | NoValidation
  | StringValidation
  | IntValidation
  | IpValidation;

interface EnumValidation {
  validation_type: "enum";
  validation_parameters: {
    names: Record<string, string | number>;
    value: string;
  };
}

interface NoValidation {
  validation_type?: null;
  validation_parameters?: null;
}

interface StringValidation {
  validation_type: "pydantic.constr" | "pydantic.constr?";
  validation_parameters: { regex: string; strict?: boolean };
}

interface IntValidation {
  validation_type: "pydantic.conint" | "pydantic.conint?" | "pydantic.conint[]";
  validation_parameters: { gt?: number; ge?: number; le?: number; lt?: number };
}

interface IpValidation {
  validation_type: "ipaddress.IPv4Address" | "ipaddress.IPv4Address?";
  validation_parameters: null;
}
