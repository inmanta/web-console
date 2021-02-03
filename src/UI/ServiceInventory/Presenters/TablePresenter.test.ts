import { TablePresenter } from "./TablePresenter";
import { AttributesPresenter } from "./AttributesPresenter";
import { instance, DummyActionPresenter, DummyDatePresenter } from "@/Test";
import { DummyStatePresenter } from "@/Test/Mock/DummyStatePresenter";

const presenter = new TablePresenter(
  new DummyDatePresenter(),
  new AttributesPresenter(),
  new DummyActionPresenter(),
  new DummyStatePresenter()
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
