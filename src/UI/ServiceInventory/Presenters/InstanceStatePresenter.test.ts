import { ServiceModel } from "@/Core";
import { instance } from "@/Test";
import { InstanceStatePresenter } from "./InstanceStatePresenter";

test("InstanceStatePresenter returns correct InstanceState when every input is correct", () => {
  const instances = [{ ...instance, ...{ instanceSetStateTargets: [] } }];
  const partialEntity = {
    name: "cloudconnectv2",
    lifecycle: { states: [{ name: "creating", label: "info" }] },
  } as ServiceModel;

  const statePresenter = new InstanceStatePresenter(instances, partialEntity);

  const stateLabel = statePresenter.getForId(instances[0].id);

  expect(stateLabel).toBeTruthy();
  expect(stateLabel?.props.color).toEqual("blue");
  expect(stateLabel?.props.icon.type.displayName).toEqual("InfoCircleIcon");
});

test("InstanceStatePresenter returns null when the instance can't be found", () => {
  const instances = [{ ...instance, ...{ instanceSetStateTargets: [] } }];
  const partialEntity = {
    name: "cloudconnectv2",
    lifecycle: { states: [{ name: "creating", label: "info" }] },
  } as ServiceModel;

  const statePresenter = new InstanceStatePresenter(instances, partialEntity);

  const stateLabel = statePresenter.getForId("id");

  expect(stateLabel).toBeFalsy();
});

test("InstanceStatePresenter returns null when the state can't be found in the lifecycle", () => {
  const instances = [{ ...instance, ...{ instanceSetStateTargets: [] } }];
  const partialEntity = {
    name: "cloudconnectv2",
    lifecycle: { states: [{ name: "up", label: "success" }] },
  } as ServiceModel;

  const statePresenter = new InstanceStatePresenter(instances, partialEntity);

  const stateLabel = statePresenter.getForId(instances[0].id);

  expect(stateLabel).toBeFalsy();
});
