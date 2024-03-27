import { Buildable, DeferredBuildable, Typeable, Constructor } from "../Type";
import { Entity } from "../../Entity";

function isResolverFunction<T extends Entity | Object>(
  type: Typeable<T>,
): type is DeferredBuildable<T> {
  // If the object's name is empty, we will assume it's an anonymous function that resolves the actual type.
  return type.name?.length === 0;
}

export class TypeMetadata<
  TargetEntity extends Entity,
  PropertyType extends Entity | Object,
> {
  constructor(
    public target: Constructor<TargetEntity>,
    public propertyName: string,
    private _type: Typeable<PropertyType>,
  ) {}

  public get type(): Buildable<PropertyType> {
    if (isResolverFunction(this._type)) {
      // Run the function to actually get the module and assign the module
      // to type prop so that the EntityBuilder will actually get an entity
      // constructor, and not a resolver function.
      return this._type();
    }

    return this._type;
  }
}
