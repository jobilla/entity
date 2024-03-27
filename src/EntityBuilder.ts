import { Entity, PartialProps } from "./Entity";
import { Constructor } from "./support/Type";
import { TypeMetadata } from "./support/metadata/TypeMetadata";
import { defaultMetadataStorage } from "./support/storage";
import { isEntityType } from "./support/isEntityType";
import { StringHelper } from "./support/StringHelper";

export class EntityBuilder {
  public static buildOne<T extends Entity>(
    buildClass: Constructor<T>,
    sourceData: PartialProps<T>,
  ): T {
    const entity = new buildClass();
    return entity.fromJson(sourceData);
  }

  public static buildMany<T extends Entity>(
    buildClass: Constructor<T>,
    sourceData: Array<PartialProps<T>>,
  ): Array<T> {
    return sourceData.map((entityData) =>
      this.buildOne(buildClass, entityData),
    );
  }

  public static fill<TargetEntity extends Entity>(
    entity: TargetEntity,
    data: PartialProps<TargetEntity>,
  ): TargetEntity {
    for (let key in data) {
      EntityBuilder.fillProperty<TargetEntity>(entity, key, data[key]);
    }

    return entity;
  }

  private static fillProperty<TargetEntity extends Entity>(
    entity: TargetEntity,
    key: string,
    value: unknown,
  ): void {
    // Don't even bother for undefined values.
    if (typeof value === "undefined") {
      return;
    }

    const metadata = defaultMetadataStorage.findTypeMetadata(
      entity.constructor as Constructor<TargetEntity>,
      key,
    );

    if (metadata) {
      EntityBuilder.fillTypeDecoratedProperty(entity, metadata, value);
      return;
    }

    // No type definition means scalar value, and we can just set that as is.
    entity.setProp(StringHelper.toCamel(key), value);
  }

  private static fillTypeDecoratedProperty<
    TargetEntity extends Entity = Entity,
    PropertyType extends Entity | Object = Entity | Object,
  >(
    entity: TargetEntity,
    metadata: TypeMetadata<TargetEntity, PropertyType>,
    value:
      | null
      | (PropertyType extends Entity
          ? PartialProps<PropertyType>
          : PropertyType),
  ) {
    // We shouldn't copy objects to our entity, as the entity should be responsible for constructing these itself.
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      if (isEntityType(metadata.type)) {
        entity.setProp(
          metadata.propertyName,
          // TypeScript cannot infer that `value` is a `PartialProps<Entity>`, but it has to be
          // when `metadata.type` is an entity.
          EntityBuilder.buildOne(metadata.type, value as PartialProps<Entity>),
        );
      } else {
        entity.setProp(metadata.propertyName, new metadata.type(value));
      }

      return;
    }

    // if we have an array, we check if it contains objects, in which case the entity itself should be assumed
    // responsible to construct the array of entities.
    if (Array.isArray(value) && value.length > 0) {
      if (isEntityType(metadata.type)) {
        entity.setProp(
          metadata.propertyName,
          EntityBuilder.buildMany(metadata.type, value),
        );
      } else {
        entity.setProp(
          metadata.propertyName,
          value.map((item) => new metadata.type(item)),
        );
      }

      return;
    }

    // Since all other scenarios have been exhausted, we're dealing with a primitive of some form.
    // This can be an empty array of objects too, but since it's empty, there's no need for us
    // to build an entity. As such, we can just assign it. The same goes for all primitives.
    entity.setProp(metadata.propertyName, value);
  }
}
