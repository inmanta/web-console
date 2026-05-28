import { render, screen, fireEvent } from "@testing-library/react";
import { DictField } from "@/Core";
import { DictFieldInput } from "./DictFieldInput";

const field: DictField = {
  name: "dict",
  description: "A dictionary field",
  isOptional: false,
  isDisabled: false,
  kind: "Dict",
  defaultValue: undefined,
  type: "",
};

const defaultValue = { default: "value" };

describe("DictFieldInput", () => {
  test("renders with the correct initial value", () => {
    render(<DictFieldInput field={field} value={defaultValue} onChange={vi.fn()} />);

    // code-editor-content is consistent with what's present in the test-setup.ts
    const content = screen.getByTestId("code-editor-content");
    const parsedValue = JSON.parse(content.textContent ?? "{}");

    expect(parsedValue).toEqual(defaultValue);
  });

  test("renders null value as the JSON literal null", () => {
    render(<DictFieldInput field={field} value={null} onChange={vi.fn()} />);

    const content = screen.getByTestId("code-editor-content");

    expect(content.textContent).toBe("null");
  });

  test("renders a pre-stringified object without crashing", () => {
    render(<DictFieldInput field={field} value={'{"default":"value"}'} onChange={vi.fn()} />);

    const content = screen.getByTestId("code-editor-content");
    const parsedValue = JSON.parse(content.textContent ?? "{}");

    expect(parsedValue).toEqual(defaultValue);
  });

  test("renders a complex value with arrays, strings, nulls, and numbers", () => {
    const complexValue = { a: [], b: "e", c: null, d: 1 };

    render(<DictFieldInput field={field} value={complexValue} onChange={vi.fn()} />);

    const content = screen.getByTestId("code-editor-content");
    const parsedValue = JSON.parse(content.textContent ?? "{}");

    expect(parsedValue).toEqual(complexValue);
  });

  test("calls onChange with parsed value when valid JSON is entered", () => {
    const onChange = vi.fn();

    render(<DictFieldInput field={field} value={{}} onChange={onChange} />);

    const editor = screen.getByTestId("code-editor-textarea");

    fireEvent.change(editor, { target: { value: '{"key":"value"}' } });

    expect(onChange).toHaveBeenCalledWith({ key: "value" });
  });

  test("calls onChange with null when the JSON literal null is entered", () => {
    const onChange = vi.fn();

    render(<DictFieldInput field={field} value={{}} onChange={onChange} />);

    const editor = screen.getByTestId("code-editor-textarea");

    fireEvent.change(editor, { target: { value: "null" } });

    expect(onChange).toHaveBeenCalledWith(null);
  });

  test("calls onChange with a complex value containing arrays, strings, nulls, and numbers", () => {
    const onChange = vi.fn();

    render(<DictFieldInput field={field} value={{}} onChange={onChange} />);

    const editor = screen.getByTestId("code-editor-textarea");

    fireEvent.change(editor, {
      target: { value: '{"a":[],"b":"e","c":null,"d":1}' },
    });

    expect(onChange).toHaveBeenCalledWith({ a: [], b: "e", c: null, d: 1 });
  });

  test("does not call onChange when invalid JSON is entered", () => {
    const onChange = vi.fn();

    render(<DictFieldInput field={field} value={{}} onChange={onChange} />);

    const editor = screen.getByTestId("code-editor-textarea");

    fireEvent.change(editor, { target: { value: "not valid json" } });

    expect(onChange).not.toHaveBeenCalled();
  });

  test("editor is disabled when readOnly is true", () => {
    render(<DictFieldInput field={field} value={defaultValue} onChange={vi.fn()} readOnly />);

    expect(screen.getByTestId("DictInput-dict")).toHaveAttribute("aria-disabled", "true");
  });

  test("editor is not disabled when readOnly is false", () => {
    render(
      <DictFieldInput field={field} value={defaultValue} onChange={vi.fn()} readOnly={false} />
    );

    expect(screen.getByTestId("DictInput-dict")).not.toHaveAttribute("aria-disabled");
  });

  test("renders the required asterisk when isOptional is false", () => {
    render(
      <DictFieldInput field={{ ...field, isOptional: false }} value={{}} onChange={vi.fn()} />
    );

    const label = screen.getByText("dict");
    const requiredAsterisk = screen.getByText("*", { exact: false });

    expect(label).toBeInTheDocument();
    expect(requiredAsterisk).toBeInTheDocument();
  });

  test("does not render the required asterisk when isOptional is true", () => {
    render(<DictFieldInput field={{ ...field, isOptional: true }} value={{}} onChange={vi.fn()} />);

    const requiredAsterisk = screen.queryByText("*", { exact: false });

    expect(requiredAsterisk).not.toBeInTheDocument();
  });
});
