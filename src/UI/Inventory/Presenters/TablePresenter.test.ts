import { TablePresenter } from "./TablePresenter";
import { DummyDatePresenter } from "./DummyDatePresenter";
import { AttributesPresenter } from "./AttributesPresenter";
import { DummyActionPresenter } from "./DummyActionPresenter";
import { instance } from "@/Fixtures";

const presenter = new TablePresenter(
  new DummyDatePresenter(),
  new AttributesPresenter(),
  new DummyActionPresenter()
);
const rows = presenter.createFromInstances([instance]);

test("TablePresenter short id", () => {
  expect(rows[0].id.short.length).toBe(4);
});

test("TablePresenter full date", () => {
  expect(rows[0].createdAt.full).toMatch("full");
});

test("TablePresenter relative date", () => {
  expect(rows[0].createdAt.relative).toMatch("relative");
});
