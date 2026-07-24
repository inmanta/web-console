/**
 * Represents different types of attributes with specific rendering requirements
 * based on their content type.
 */
export type ClassifiedAttribute = Undefined | SingleLine | Password | File | Json | Xml | Code;

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
 * Base for attributes whose `value` is a pretty-printed view of an original
 * string. `rawValue` carries that original, compact form so the UI can offer a
 * "copy raw value" action — reconstructing it from the formatted `value` is not
 * reliable (XML formatting in particular has no exact inverse).
 *
 * @template Kind The specific type identifier
 */
interface Formatted<Kind> extends Base<Kind> {
  rawValue: string;
}

/**
 * Represents a JSON formatted attribute
 */
type Json = Formatted<"Json">;

/**
 * Represents an XML formatted attribute
 */
type Xml = Formatted<"Xml">;

/**
 * Represents a password attribute (sensitive content)
 */
type Password = Base<"Password">;

/**
 * Represents a file path or file content attribute
 */
type File = Base<"File">;

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
