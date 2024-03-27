import { TypeMetadata } from "./TypeMetadata";
import { JsonExcludeMetadata } from "./JsonExcludeMetadata";
import { Entity } from "../../Entity";
import { Typeable } from "../Type";

/**
 * Storage all library metadata.
 */
export class MetadataStorage {
  /**
   * All the type metadata.
   *
   * @type {Array}
   */
  private typeMetadatas: TypeMetadata<Entity, Entity | Object>[] = [];
  private excludedProperties: JsonExcludeMetadata[] = [];

  /**
   * Append type metadata.
   *
   * @param metadata
   */
  addTypeMetadata(metadata: TypeMetadata<Entity, Entity | Object>) {
    this.typeMetadatas.push(metadata);
  }

  addExcludeProperty(excludeMeta: JsonExcludeMetadata) {
    this.excludedProperties.push(excludeMeta);
  }

  /**
   * Find a type metadata.
   *
   * @param target
   * @param propertyName
   * @returns {TypeMetadata}
   */
  findTypeMetadata<TargetEntity extends Entity>(
    target: any,
    propertyName: string,
  ): TypeMetadata<TargetEntity, Entity | Object> {
    const metadataFromTarget = this.typeMetadatas.find(
      (meta) => meta.target === target && meta.propertyName === propertyName,
    );

    if (metadataFromTarget) {
      return metadataFromTarget as TypeMetadata<
        TargetEntity,
        Typeable<Entity | Object>
      >;
    }

    const metadataFromChildren = this.typeMetadatas.find(
      (meta) =>
        target.prototype instanceof meta.target &&
        meta.propertyName === propertyName,
    );

    return metadataFromChildren as TypeMetadata<
      TargetEntity,
      Typeable<Entity | Object>
    >;
  }

  isPropertyExcluded(target: any, propertyName: string): boolean {
    return (
      this.excludedProperties.some(
        (propertyMeta) =>
          propertyMeta.target === target &&
          propertyMeta.propertyName === propertyName,
      ) ||
      this.excludedProperties.some(
        (propertyMeta) =>
          target.prototype instanceof propertyMeta.target &&
          propertyMeta.propertyName === propertyName,
      )
    );
  }
}
