import { Entity } from "../../src";
import { Type } from "../../src";
import { BlogPost } from "./blog";

export default class Comment extends Entity {
  public body!: string;

  @Type(() => BlogPost)
  public blog!: BlogPost;
}
