import { TablePresenter } from "./TablePresenter";
import { instance } from "@app/fixtures";
import { DummyDatePresenter } from "./DummyDatePresenter";
import { AttributePresenter } from "./AttributePresenter";

const presenter = new TablePresenter(
  new DummyDatePresenter(),
  new AttributePresenter()
);
const rows = presenter.createFromInstances([instance]);

test("TablePresenter short id", () => {
  expect(rows[0].id.length).toBe(4);
});

test("TablePresenter full date", () => {
  expect(rows[0].createdAt.full).toMatch("full");
});

test("TablePresenter relative date", () => {
  expect(rows[0].createdAt.relative).toMatch("relative");
});
