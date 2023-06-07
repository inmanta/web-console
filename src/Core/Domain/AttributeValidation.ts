import { ParsedNumber } from "@/Core/Language";

export type AttributeValidation =
  | EnumValidation
  | NoValidation
  | StringValidation
  | IntValidation
  | IpValidation;

interface EnumValidation {
  validation_type: "enum" | "enum?";
  validation_parameters: {
    names: Record<string, string | ParsedNumber>;
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
  validation_parameters: {
    gt?: ParsedNumber;
    ge?: ParsedNumber;
    le?: ParsedNumber;
    lt?: ParsedNumber;
  };
}

interface IpValidation {
  validation_type:
    | "ipaddress.IPv4Address"
    | "ipaddress.IPv4Address?"
    | "ipaddress.IPv4Interface"
    | "pydantic.constr[]"
    | "ipaddress.IPv4Network";
  validation_parameters: { [key: string]: string } | null;
}
