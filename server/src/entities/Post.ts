import { Exclude, Expose } from "class-transformer";
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { makeId, slugify } from "../utils/helpers";
import Comment from "./Comment";
import BaseEntity from "./Entity";
import Forum from "./Forum";
import { User } from "./User";
import Vote from "./Vote";

@Entity("posts")
export default class Post extends BaseEntity {
  @Index()
  @Column()
  identifier: string;

  @Column()
  title: string;

  @Index()
  @Column()
  slug: string;

  @Column({ nullable: true, type: "text" })
  body: string;

  @Column()
  forumName: string;

  @Column()
  username: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @ManyToOne(() => Forum, (forum) => forum.posts)
  @JoinColumn({ name: "forumName", referencedColumnName: "name" })
  forum: Forum;

  @Exclude()
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @Exclude()
  @OneToMany(() => Vote, (vote) => vote.post)
  votes: Vote[];

  @Expose()
  get url(): string {
    return `/f/${this.forumName}/${this.identifier}/${this.slug}`;
  }

  @Expose()
  get commentCount(): number {
    return this.comments?.length || 0;
  }

  @Expose()
  get voteScore(): number {
    return this.votes?.reduce((memo, curt) => memo + (curt.value || 0), 0) || 0;
  }

  protected userVote: number;

  setUserVote(user: User) {
    const index = this.votes?.findIndex((v) => v.username === user.username);
    this.userVote = index > -1 ? this.votes[index].value : 0;
  }

  @BeforeInsert()
  makeIdAndSlug() {
    this.identifier = makeId(7);
    this.slug = slugify(this.title);
  }
}
