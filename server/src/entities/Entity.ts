import {
  PrimaryGeneratedColumn,
  BaseEntity as TypeORMBaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { instanceToPlain } from "class-transformer";

export default abstract class BaseEntity extends TypeORMBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toJSON() {
    return instanceToPlain(this);
  }
}
