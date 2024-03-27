import { Buildable, Constructor } from "./Type";
import { Entity } from "../Entity";

export function isEntityType<T extends Entity>(
  buildable: Buildable<T | Object>,
): buildable is Constructor<T> {
  return buildable?.prototype instanceof Entity;
}
