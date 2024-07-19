import { ApiProperty } from '@nestjs/swagger';
import { CommonEntity } from 'src/modules/common/entity/common.entity';
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from 'src/modules/user/entity/user.entity';
import { CommentEntity } from 'src/modules/comment/entity/comment.entity';
@Entity({
  name: 'post',
})
export class PostEntity extends CommonEntity {
  /**
   * Content column
   */
  @ApiProperty({
    required: true,
    example: 'Good morning',
  })
  @Column({ length: 255 })
  content: string;

  @ApiProperty({
    required: true,
  })
  @Index()
  @ManyToOne(() => UserEntity, (user) => user.posts, { nullable: true })
  @JoinColumn()
  byUser: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.byPost)
  comments: string[];
}
