import { IsEmail, Length } from "class-validator";
import {
  Entity,
  Column,
  Index,
  OneToMany,
  BeforeInsert,
} from "typeorm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import Post from "./Post";
import Vote from "./Vote";
import Comment from "./Comment";
import BaseEntity from "./Entity";

@Entity("users")
export class User extends BaseEntity {
  @Index()
  @IsEmail(undefined, { message: "이메일 주소가 잘못되었습니다." })
  @Length(1, 255, { message: "이메일 주소는 비워둘 수 없습니다." })
  @Column({ unique: true })
  email: string;

  @Index()
  @Length(3, 32, { message: "사용자 이름은 3자 이상이어야 합니다." })
  @Column({ unique: true })
  username: string;

  @Column()
  @Length(6, 255, { message: "비밀번호는 6자리 이상이어야 합니다." })
  password: string;

  // 이메일 인증 관련 필드
  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true, type: "timestamp" })
  emailVerificationExpires: Date;

  // 비밀번호 재설정 관련 필드
  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true, type: "timestamp" })
  passwordResetExpires: Date;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // 이메일 인증 토큰 생성
  generateEmailVerificationToken(): string {
    const token = crypto.randomBytes(32).toString("hex");
    this.emailVerificationToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간
    return token;
  }

  // 비밀번호 재설정 토큰 생성
  generatePasswordResetToken(): string {
    const token = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1시간
    return token;
  }

  // 해시된 토큰 검증
  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
