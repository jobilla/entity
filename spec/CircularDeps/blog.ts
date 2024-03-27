import { Entity } from "../../src";
import { Type } from "../../src";
import Comment from "./comment";

export class BlogPost extends Entity {
  public title!: string;
  public body!: string;

  @Type(() => Comment)
  public comments: Comment[] = [];
}
