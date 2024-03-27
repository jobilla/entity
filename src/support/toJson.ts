import { defaultMetadataStorage } from "./storage";
import { StringHelper } from "./StringHelper";
import { Entity, Props } from "../Entity";

export function toJson<TargetEntity extends Entity>(
  entity: TargetEntity,
): Props<TargetEntity> {
  const data: any = {};

  for (let key in entity) {
    if (!entity.hasOwnProperty(key)) {
      continue;
    }

    // exclude any properties with `@JsonExclude()`
    if (defaultMetadataStorage.isPropertyExcluded(entity.constructor, key)) {
      continue;
    }

    let outputKey = StringHelper.toSnake(key);

    const value: any = entity[key];

    if (value instanceof Entity) {
      data[outputKey] = value.toJson() as Props<typeof value>;

      continue;
    }

    const metadata = defaultMetadataStorage.findTypeMetadata(
      entity.constructor,
      key,
    );

    if (
      Array.isArray(value) &&
      value.length > 0 &&
      value[0] instanceof Object
    ) {
      if (value[0] instanceof Entity) {
        data[outputKey] = value.map((entity: Entity) => entity.toJson());
      }

      if (metadata && metadata.type === Object) {
        data[outputKey] = value;
      }

      continue;
    }

    // If the key has been manually annotated as an object,
    // we will simply output the object itself.
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      if (metadata && metadata.type === Object) {
        data[outputKey] = value;
      }

      continue;
    }

    data[outputKey] = value;
  }

  return data;
}
