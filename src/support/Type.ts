import { defaultMetadataStorage } from "./storage";
import { StringHelper } from "./StringHelper";
import { TypeMetadata } from "./metadata/TypeMetadata";
import { Entity } from "../Entity";

export type Constructor<T> = { new (...args: any): T };

// Types that can be passed as first argument to `EntityBuilder`.
export type Buildable<T extends Entity | Object> = Constructor<T>;

export type DeferredBuildable<T extends Entity | Object> = () => Buildable<T>;

// Types that can be passed to @Type decorator factory.
export type Typeable<PropertyType extends Entity | Object> =
  | Buildable<PropertyType>
  | DeferredBuildable<PropertyType>;

export function Type<TargetEntity extends Entity>(
  type: Typeable<Entity | Object>,
) {
  return function (target: TargetEntity, key: string) {
    defaultMetadataStorage.addTypeMetadata(
      new TypeMetadata(
        target.constructor as Constructor<TargetEntity>,
        StringHelper.toSnake(key),
        type,
      ),
    );
  };
}
