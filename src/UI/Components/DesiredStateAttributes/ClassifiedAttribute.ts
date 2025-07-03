/**
 * Represents different types of attributes with specific rendering requirements
 * based on their content type.
 */
export type ClassifiedAttribute =
  | Undefined
  | SingleLine
  | MultiLine
  | Password
  | File
  | Json
  | Xml
  | Python
  | Code;

/**
 * Base interface for attribute types that have a key-value structure
 * @template Kind The specific type identifier
 */
interface Base<Kind> {
  kind: Kind;
  key: string;
  value: string;
}

/**
 * Represents a single line text attribute
 */
type SingleLine = Base<"SingleLine">;

/**
 * Represents a multi-line text attribute
 */
type MultiLine = Base<"MultiLine">;

/**
 * Represents a JSON formatted attribute
 */
type Json = Base<"Json">;

/**
 * Represents an XML formatted attribute
 */
type Xml = Base<"Xml">;

/**
 * Represents a password attribute (sensitive content)
 */
type Password = Base<"Password">;

/**
 * Represents a file path or file content attribute
 */
type File = Base<"File">;

/**
 * Represents a Python code attribute
 */
type Python = Base<"Python">;

/**
 * Represents generic code attribute (language unspecified)
 */
type Code = Base<"Code">;

/**
 * Represents an undefined attribute that has a key but no value
 */
interface Undefined {
  kind: "Undefined";
  key: string;
}
