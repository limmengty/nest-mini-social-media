import { ApiProperty } from '@nestjs/swagger';
import { CommonEntity } from 'src/modules/common/entity/common.entity';
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UserEntity } from 'src/modules/user/entity/user.entity';
import { PostEntity } from 'src/modules/post/entity/post.entity';
@Entity({
  name: 'comment',
})
export class CommentEntity extends CommonEntity {
  /**
   * message column
   */
  @ApiProperty({
    required: true,
    example: 'Good morning',
  })
  @Column({ length: 255 })
  message: string;

  @Index()
  @ManyToOne(() => UserEntity, (user) => user.comments)
  @JoinColumn()
  byUser: UserEntity;

  @Index()
  @ManyToOne(() => PostEntity, (post) => post.comments, { nullable: true })
  @JoinColumn()
  byPost: string;
}
