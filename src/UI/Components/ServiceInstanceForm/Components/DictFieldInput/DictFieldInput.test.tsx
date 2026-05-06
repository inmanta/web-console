import { render, screen, fireEvent } from "@testing-library/react";
import { DictField } from "@/Core";
import { DictFieldInput } from "./DictFieldInput";

vi.mock("@monaco-editor/react", () => ({
  Editor: ({ onChange, value }: { onChange: (v: string) => void; value: string }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

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

    const hiddenInput = screen.getByTestId("DictInput-dict");
    const parsedValue = JSON.parse(hiddenInput.getAttribute("value") ?? "{}");

    expect(parsedValue).toEqual(defaultValue);
  });

  test("calls onChange with parsed value when valid JSON is entered", () => {
    const onChange = vi.fn();

    render(<DictFieldInput field={field} value={{}} onChange={onChange} />);

    const editor = screen.getByTestId("monaco-editor");

    fireEvent.change(editor, { target: { value: '{"key":"value"}' } });

    expect(onChange).toHaveBeenCalledWith({ key: "value" });
  });

  test("does not call onChange when invalid JSON is entered", () => {
    const onChange = vi.fn();

    render(<DictFieldInput field={field} value={{}} onChange={onChange} />);

    const editor = screen.getByTestId("monaco-editor");

    fireEvent.change(editor, { target: { value: "not valid json" } });

    expect(onChange).not.toHaveBeenCalled();
  });

  test("hidden input is disabled when readOnly is true", () => {
    render(<DictFieldInput field={field} value={defaultValue} onChange={vi.fn()} readOnly />);

    const hiddenInput = screen.getByTestId("DictInput-dict");

    expect(hiddenInput).toBeDisabled();
  });

  test("hidden input is enabled when readOnly is false", () => {
    render(
      <DictFieldInput field={field} value={defaultValue} onChange={vi.fn()} readOnly={false} />
    );

    const hiddenInput = screen.getByTestId("DictInput-dict");

    expect(hiddenInput).not.toBeDisabled();
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
