import { defaultMetadataStorage } from "./support/storage";
import { EntityBuilder } from "./EntityBuilder";
import { toJson } from "./support/toJson";

/**
 * This type converts given string's camelCase parts to snake_case.
 */
type Snake<T extends string> = string extends T
  ? string
  : T extends `${infer C0}${infer R}`
    ? `${C0 extends "_" ? "" : C0 extends Uppercase<C0> ? "_" : ""}${Lowercase<C0>}${Snake<R>}`
    : "";

/**
 * This generic type returns a new type from the given entity class that only
 * includes the data properties of the entity. It will not
 * include any methods of the entity.
 */
export type Props<T extends Entity> = {
  [K in keyof T as T[K] extends Function
    ? never
    : Snake<Extract<K, string>>]: T[K] extends Entity[]
    ? Props<T[K][number]>[]
    : T[K] extends Entity[] | undefined
      ? Props<Exclude<T[K], undefined>[number]>[] | undefined
      : T[K] extends Entity
        ? Props<T[K]>
        : T[K] extends Entity | undefined
          ? Props<Exclude<T[K], undefined>> | undefined
          : T[K] extends Entity | null
            ? Props<NonNullable<T[K]>> | undefined
            : T[K] extends Entity | null | undefined
              ? Props<Exclude<T[K], null | undefined>> | null | undefined
              : T[K];
};

/**
 * The reason this type exists instead of just doing `Partial<Props<T>>` is
 * because the partiality is recursive. `Partial<Props<T>>` and
 * `PartialProps<T>` will generate different result
 * for entities that have Entity props.
 */
export type PartialProps<T extends Entity> = {
  [K in keyof T as T[K] extends Function
    ? never
    : Snake<Extract<K, string>>]?: T[K] extends Entity[]
    ? PartialProps<T[K][number]>[]
    : T[K] extends Entity[] | undefined
      ? PartialProps<Exclude<T[K], undefined>[number]>[] | undefined
      : T[K] extends Entity
        ? PartialProps<T[K]>
        : T[K] extends Entity | undefined
          ? PartialProps<Exclude<T[K], undefined>> | undefined
          : T[K] extends Entity | null
            ? PartialProps<Exclude<T[K], null>> | undefined
            : T[K] extends Entity | null | undefined
              ? PartialProps<Exclude<T[K], null | undefined>> | null | undefined
              : T[K];
};

export class Entity {
  hasProp(key: string): boolean {
    if (Object.prototype.hasOwnProperty.call(this, key)) {
      return true;
    }

    return !!defaultMetadataStorage.findTypeMetadata(this.constructor, key);
  }

  getProp(key: string) {
    if (!this.hasProp(key)) {
      return;
    }

    return (this as any)[key];
  }

  setProp(key: string, value: any) {
    if (!this.hasProp(key)) {
      return;
    }

    (this as any)[key] = value;
  }

  toJson() {
    return toJson(this);
  }

  fromJson(data: PartialProps<this>) {
    EntityBuilder.fill(this, data);
    return this;
  }
}
