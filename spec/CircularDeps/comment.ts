import { Entity } from '../../src/Entity';
import { Type } from '../../src/support/Type';
import { BlogPost } from './blog';

export class Comment extends Entity {
    public body: string = null;

    @Type(async () => (await import('./blog')).BlogPost)
    public blog: BlogPost = null;
}
