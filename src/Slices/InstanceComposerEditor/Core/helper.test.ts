import { Service } from "@/Test";
import { filterServices } from "./helper";

const serviceAWithOwnership = {
  ...Service.a,
  owned_entities: [Service.b.name],
};
const serviceBWithOwnership = {
  ...Service.b,
  owned_entities: [Service.c.name],
};

it.each`
  services                                         | mainService              | expectedResult
  ${[Service.a, Service.b]}                        | ${Service.a}             | ${[]}
  ${[Service.a, Service.b]}                        | ${serviceAWithOwnership} | ${[Service.b]}
  ${[Service.a, serviceBWithOwnership, Service.c]} | ${serviceAWithOwnership} | ${[serviceBWithOwnership, Service.c]}
`(
  "filterServices should return array of services based on their respective ownership",
  ({ services, mainService, expectedResult }) => {
    const result = filterServices(services, mainService);
    expect(result).toStrictEqual(expectedResult);
  },
);
