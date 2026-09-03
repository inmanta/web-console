import { ServiceModel, StateModel, TransferModel } from "@/Core";
import { warnUnrecognisedAnnotations } from "./AnnotationWarnings";

const baseState: StateModel = {
  name: "up",
  export_resources: false,
  purge_resources: false,
  deleted: false,
};

const baseTransfer: TransferModel = {
  source: "up",
  target: "setting_start",
  error: null,
  on_update: false,
  on_delete: false,
  api_set_state: true,
  resource_based: false,
  auto: false,
  validate: false,
  config_name: null,
  description: "",
  target_operation: null,
  error_operation: null,
};

/** Test-only escape hatch: raw annotation objects, unconstrained by
 * `StateAnnotations`/`TransferAnnotations` - the whole point is exercising keys
 * those interfaces don't know about (unrecognised, or not-yet-typed like
 * `web_advanced_state`, since annotations are opaque pass-through at runtime). */
const stateWith = (annotations: Record<string, unknown>): StateModel => ({
  ...baseState,
  annotations: annotations as StateModel["annotations"],
});

const transferWith = (annotations: Record<string, unknown>): TransferModel => ({
  ...baseTransfer,
  annotations: annotations as TransferModel["annotations"],
});

const buildServiceModel = (states: StateModel[], transfers: TransferModel[]): ServiceModel =>
  ({
    lifecycle: { initial_state: "up", states, transfers },
  }) as ServiceModel;

describe("warnUnrecognisedAnnotations", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("warns for an unrecognised web_* key on a state", () => {
    const serviceModel = buildServiceModel([stateWith({ web_lable: "Up" })], []);

    warnUnrecognisedAnnotations(serviceModel, new Set());

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      '⚠ [lsm] unrecognised annotation key\n   "web_lable" on state "up" — ignored.\n   Did you mean "web_label"?'
    );
  });

  it("warns for an unrecognised web_* key on a transfer", () => {
    const serviceModel = buildServiceModel([], [transferWith({ web_buton_label: "Push" })]);

    warnUnrecognisedAnnotations(serviceModel, new Set());

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      '⚠ [lsm] unrecognised annotation key\n   "web_buton_label" on transfer "up -> setting_start" — ignored.\n   Did you mean "web_button_label"?'
    );
  });

  it("does not warn for a recognised key", () => {
    const serviceModel = buildServiceModel(
      [stateWith({ web_label: "Up", web_icon: "FaCheck" })],
      [transferWith({ web_confirm: "Sure?", web_advanced_state: true })]
    );

    warnUnrecognisedAnnotations(serviceModel, new Set());

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("does not warn for a non-web_* key", () => {
    const serviceModel = buildServiceModel([stateWith({ some_other_key: "value" })], []);

    warnUnrecognisedAnnotations(serviceModel, new Set());

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("omits the suggestion when no recognised key is close enough", () => {
    const serviceModel = buildServiceModel(
      [stateWith({ web_completely_unrelated_thing: "x" })],
      []
    );

    warnUnrecognisedAnnotations(serviceModel, new Set());

    expect(warnSpy).toHaveBeenCalledWith(
      '⚠ [lsm] unrecognised annotation key\n   "web_completely_unrelated_thing" on state "up" — ignored.'
    );
  });

  it("only warns once per unique (location, key) across repeated calls", () => {
    const serviceModel = buildServiceModel([stateWith({ web_lable: "Up" })], []);
    const seen = new Set<string>();

    warnUnrecognisedAnnotations(serviceModel, seen);
    warnUnrecognisedAnnotations(serviceModel, seen);
    warnUnrecognisedAnnotations(serviceModel, seen);

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("warns again for the same key at a different location", () => {
    const serviceModel = buildServiceModel(
      [
        { ...stateWith({ web_lable: "Up" }), name: "up" },
        { ...stateWith({ web_lable: "Down" }), name: "down" },
      ],
      []
    );

    warnUnrecognisedAnnotations(serviceModel, new Set());

    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it("does nothing when the service model is undefined", () => {
    warnUnrecognisedAnnotations(undefined, new Set());

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
