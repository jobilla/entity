import { Entity, EntityBuilder, JsonExclude, Type } from "../src";

class User extends Entity {
  public name!: string;
  public email!: string;
  public daysAvailable!: string[];
}

class Address extends Entity {
  public street!: string;
  public city!: string;
  public zip!: string;
  public country!: string;
}

class Post extends Entity {
  public title!: string;
  public content!: string;
}

class UserWithAddress extends User {
  public address!: Address;
}

class UserWithAnnotatedAddress extends User {
  @Type(Address)
  public address!: Address;
}

class UserWithAnnotatedPosts extends User {
  @Type(Post)
  public posts?: Post[];
}

class UserWithAnnotatedObject extends User {
  @Type(Object)
  public address!: { [key: string]: string };
}

class UserWithExcludedOutput extends User {
  @JsonExclude()
  public value: string = "test";
}

class UserWithDefaultValue extends User {
  public company: string | null = "Jobilla Oy";
}

describe("EntityBuilder", () => {
  it("can decode a json payload into an entity", async () => {
    const user = EntityBuilder.buildOne(User, {
      name: "Decahedron Technologies Ltd.",
      email: "hello@decahedron.io",
      days_available: ["Monday", "Wednesday", "Friday"],
    });

    expect(user.name).toEqual("Decahedron Technologies Ltd.");
    expect(user.email).toEqual("hello@decahedron.io");
    expect(user.daysAvailable).toEqual(["Monday", "Wednesday", "Friday"]);
  });

  it("decodes a non-annotated nested object as POJO", async () => {
    const user = EntityBuilder.buildOne(UserWithAddress, {
      name: "Decahedron Technologies Ltd.",
      email: "hello@decahedron.io",
      days_available: ["Monday", "Wednesday", "Friday"],
      address: {
        street: "20-22 Wenlock Road",
        city: "London",
        zip: "N1 7GU",
        country: "United Kingdom",
      },
    });

    expect(user.address).toMatchObject({
      street: "20-22 Wenlock Road",
      city: "London",
      zip: "N1 7GU",
      country: "United Kingdom",
    });
  });

  it("decodes an annotated nested object", async () => {
    const user = EntityBuilder.buildOne(UserWithAnnotatedAddress, {
      name: "Decahedron Technologies Ltd.",
      email: "hello@decahedron.io",
      days_available: ["Monday", "Wednesday", "Friday"],
      address: {
        street: "20-22 Wenlock Road",
        city: "London",
        zip: "N1 7GU",
        country: "United Kingdom",
      },
    });

    expect(user.address).toBeDefined();
    expect(user.address.street).toEqual("20-22 Wenlock Road");
    expect(user.address.city).toEqual("London");
    expect(user.address.zip).toEqual("N1 7GU");
    expect(user.address.country).toEqual("United Kingdom");
  });

  it("decodes an annotated optional nested array object", async () => {
    const user = EntityBuilder.buildOne(UserWithAnnotatedPosts, {
      name: "Decahedron Technologies Ltd.",
      email: "hello@decahedron.io",
      days_available: ["Monday", "Wednesday", "Friday"],
      posts: [
        {
          title: "About",
          content: "Lorem ipsum dolor sit amet",
        },
      ],
    });

    expect(user.posts).toBeDefined();
    expect(user.posts?.[0]).toBeDefined();
    expect(user.posts?.[0].title).toEqual("About");
    expect(user.posts?.[0].content).toEqual("Lorem ipsum dolor sit amet");
  });

  it("decodes an annotated optional nested array object to empty array", async () => {
    const user = EntityBuilder.buildOne(UserWithAnnotatedPosts, {
      name: "Decahedron Technologies Ltd.",
      email: "hello@decahedron.io",
      days_available: ["Monday", "Wednesday", "Friday"],
      posts: [],
    });

    expect(user.posts).toBeDefined();
    expect(user.posts).toEqual([]);
  });

  it("persists default value if nothing is provided for a property", () => {
    const user = EntityBuilder.buildOne(UserWithDefaultValue, {
      name: "Decahedron Technologies Ltd",
    });

    expect(user.company).toEqual("Jobilla Oy");

    const userWithExplicitUndefined = EntityBuilder.buildOne(
      UserWithDefaultValue,
      {
        name: "Decahedron Technologies Ltd",
        company: undefined,
      },
    );

    expect(user.company).toEqual("Jobilla Oy");
    expect(userWithExplicitUndefined.company).toEqual("Jobilla Oy");
  });

  it("does not persist default value if null is provided for a property", () => {
    const user = EntityBuilder.buildOne(UserWithDefaultValue, {
      name: "Decahedron Technologies Ltd",
      company: null,
    });

    expect(user.company).toEqual(null);
  });

  it("does not persist default value if non-null value is provided for a property", () => {
    let user;

    user = EntityBuilder.buildOne(UserWithDefaultValue, {
      name: "Decahedron Technologies Ltd",
      company: "",
    });

    expect(user.company).not.toEqual("Jobilla Oy");

    user = EntityBuilder.buildOne(UserWithDefaultValue, {
      name: "Decahedron Technologies Ltd",
      company: "Not Jobilla Ayy!",
    });

    expect(user.company).not.toEqual("Jobilla Oy");
  });

  it("can decode an annotated Object, without being an entity", async () => {
    const user = EntityBuilder.buildOne(UserWithAnnotatedObject, {
      name: "Decahedron Technologies Ltd",
      email: "hello@decahedron.io",
      days_available: ["Monday", "Wednesday", "Friday"],
      address: {
        street: "20-22 Wenlock Road",
        city: "London",
        zip: "N1 7GU",
        country: "United Kingdom",
      },
    });

    expect(user.address).toBeDefined();
    expect(user.address["street"]).toEqual("20-22 Wenlock Road");
    expect(user.address["city"]).toEqual("London");
    expect(user.address["zip"]).toEqual("N1 7GU");
    expect(user.address["country"]).toEqual("United Kingdom");
  });

  it("can encode itself to a plain object", async () => {
    const user = EntityBuilder.buildOne(User, {
      name: "Decahedron Technologies Ltd.",
      email: "hello@decahedron.io",
      days_available: ["Monday", "Wednesday", "Friday"],
    });

    expect(user.toJson()).toEqual({
      name: "Decahedron Technologies Ltd.",
      email: "hello@decahedron.io",
      days_available: ["Monday", "Wednesday", "Friday"],
    });
  });

  it("can encode itself and its children to a plain object", async () => {
    const user = EntityBuilder.buildOne(UserWithAnnotatedAddress, {
      name: "Decahedron Technologies Ltd.",
      email: "hello@decahedron.io",
      days_available: ["Monday", "Wednesday", "Friday"],
      address: {
        street: "20-22 Wenlock Road",
        city: "London",
        zip: "N1 7GU",
        country: "United Kingdom",
      },
    });

    expect(user.toJson()).toEqual({
      name: "Decahedron Technologies Ltd.",
      email: "hello@decahedron.io",
      days_available: ["Monday", "Wednesday", "Friday"],
      address: {
        street: "20-22 Wenlock Road",
        city: "London",
        zip: "N1 7GU",
        country: "United Kingdom",
      },
    });
  });

  it("can encode itself and its array children to a plain object", async () => {
    const user = EntityBuilder.buildOne(UserWithAnnotatedPosts, {
      name: "Decahedron Technologies Ltd.",
      email: "hello@decahedron.io",
      days_available: ["Monday", "Wednesday", "Friday"],
      posts: [
        {
          title: "About",
          content: "Lorem ipsum dolor sit amet",
        },
      ],
    });

    expect(user.toJson()).toEqual({
      name: "Decahedron Technologies Ltd.",
      email: "hello@decahedron.io",
      days_available: ["Monday", "Wednesday", "Friday"],
      posts: [
        {
          title: "About",
          content: "Lorem ipsum dolor sit amet",
        },
      ],
    });
  });

  it("should preserve null values for annotated attributes", async () => {
    const user = EntityBuilder.buildOne(UserWithAnnotatedAddress, {
      name: "Decahedron Technologies Ltd.",
      email: "hello@decahedron.io",
      days_available: ["Monday", "Wednesday", "Friday"],
      address: undefined,
    });

    expect(user.toJson()).toEqual({
      name: "Decahedron Technologies Ltd.",
      email: "hello@decahedron.io",
      days_available: ["Monday", "Wednesday", "Friday"],
      address: undefined,
    });
  });

  it("should preserve null values for non-annotated attributes", async () => {
    const user = EntityBuilder.buildOne(UserWithAnnotatedAddress, {
      name: "Decahedron Technologies Ltd.",
      email: undefined,
      days_available: ["Monday", "Wednesday", "Friday"],
      address: {
        street: "20-22 Wenlock Road",
        city: "London",
        zip: "N1 7GU",
        country: "United Kingdom",
      },
    });

    expect(user.toJson()).toEqual({
      name: "Decahedron Technologies Ltd.",
      email: undefined,
      days_available: ["Monday", "Wednesday", "Friday"],
      address: {
        street: "20-22 Wenlock Road",
        city: "London",
        zip: "N1 7GU",
        country: "United Kingdom",
      },
    });
  });

  it("excludes @JsonExclude annotated keys from the output object", () => {
    const user = new UserWithExcludedOutput();
    user.name = "Batman";
    user.email = "noreply@batman.example.com";

    const output = user.toJson();
    expect(output.value).toBeUndefined();
  });
});
