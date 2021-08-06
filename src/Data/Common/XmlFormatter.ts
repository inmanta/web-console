import { Formatter } from "@/Core";
import formatXml from "xml-formatter";

export class XmlFormatter implements Formatter {
  format(source: string): string {
    return formatXml(source, { collapseContent: true });
  }
}
