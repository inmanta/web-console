import { DeploymentProgressPresenter } from "./DeploymentProgressPresenter";

test("DeploymentProgressPresenter returns properly parametrized Progress Bar", () => {
  const progressPresenter = new DeploymentProgressPresenter();

  const stackedProgressBar = progressPresenter.getDeploymentProgressBar({
    total: 10,
    failed: 3,
    deployed: 5,
    waiting: 2,
  });

  expect(stackedProgressBar).toBeTruthy();
  expect(stackedProgressBar?.props.total).toEqual(10);
  expect(stackedProgressBar?.props.failed).toEqual(3);
  expect(stackedProgressBar?.props.success).toEqual(5);
  expect(stackedProgressBar?.props.waiting).toEqual(2);

  const emptyProgressBar =
    progressPresenter.getDeploymentProgressBar(undefined);

  expect(emptyProgressBar).toBeTruthy();
  expect(emptyProgressBar?.props.total).toEqual(0);
  expect(emptyProgressBar?.props.failed).toEqual(0);
  expect(emptyProgressBar?.props.success).toEqual(0);
  expect(emptyProgressBar?.props.waiting).toEqual(0);
});
