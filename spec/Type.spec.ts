import { Type } from "../src";
import { defaultMetadataStorage } from "../src/support/storage";
import { Entity } from "../src";

class Decorated extends Entity {}

describe("Decorators - Type", () => {
  describe("Inferred attribute names", () => {
    it("Stores the target type, attribute name and infers the source attribute name", () => {
      let decorator = Type(Decorated);
      let fn = (): null => null;
      decorator(fn as unknown as Entity, "attribute");

      let storedMetadata = defaultMetadataStorage.findTypeMetadata(
        fn.constructor,
        "attribute",
      );
      expect(storedMetadata).not.toBeUndefined();
      expect(storedMetadata.propertyName).toEqual("attribute");
      expect(storedMetadata.type).toEqual(Decorated);
    });

    it("Infers that the source name should be snake_case", () => {
      let decorator = Type(Decorated);
      let fn = (): null => null;
      decorator(fn as unknown as Entity, "camelAttribute");

      let storedMetadata = defaultMetadataStorage.findTypeMetadata(
        fn.constructor,
        "camel_attribute",
      );
      expect(storedMetadata).not.toBeUndefined();
      expect(storedMetadata.propertyName).toEqual("camel_attribute");
      expect(storedMetadata.type).toEqual(Decorated);
    });
  });
});
