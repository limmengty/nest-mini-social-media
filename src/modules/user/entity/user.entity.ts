import { ApiProperty } from '@nestjs/swagger';
import { CommonEntity } from 'src/modules/common/entity/common.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { PasswordTransformer } from '../password.transformer';
import { UsersTypeEnum } from 'src/modules/common/enum/user_type.enum';
import { AppRoles } from 'src/modules/common/enum/roles.enum';
import { PostEntity } from 'src/modules/post/entity/post.entity';
import { CommentEntity } from 'src/modules/comment/entity/comment.entity';
@Entity({
  name: 'user',
})
export class UserEntity extends CommonEntity {
  /**
   * Unique username column
   */
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: 'mengty',
  })
  @Column({ length: 255, unique: true })
  username: string;

  /**
   * FirstName column
   */
  @ApiProperty()
  @Column({ length: 255 })
  firstname: string;

  /**
   * LastName column
   */
  @ApiProperty()
  @Column({ length: 255, nullable: true })
  lastname: string;

  /**
   * Email column
   */
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: '@gmail.com',
  })
  @Column({ type: 'text', unique: true })
  email: string;

  @Column({
    type: 'simple-array',
    enum: AppRoles,
    default: AppRoles.DEFAULT,
  })
  roles: AppRoles[];

  /**
   * Password column
   */
  @ApiProperty({
    required: true,
    uniqueItems: true,
    example: '11111111',
  })
  @Column({
    name: 'password',
    length: 255,
    transformer: new PasswordTransformer(),
  })
  password: string;

  /**
   * User registration type: email, Facebook, Google, or GitHub
   */
  @Column({
    type: 'enum',
    enum: UsersTypeEnum,
    default: UsersTypeEnum.PASSWORD,
  })
  registrationType: string;

  @OneToMany(() => PostEntity, (user) => user.comments)
  // @JoinColumn({ name: 'byPostId' })
  posts: PostEntity[];

  @OneToMany(() => CommentEntity, (user) => user.byUser)
  comments: string[];

  @Column({ type: 'text', nullable: true })
  picture: string;

  /**
   * Refresh Token
   */
  @Column({
    nullable: true,
  })
  // @Exclude()
  public refreshToken?: string;

  /**
   * Omit password from query selection
   */
  toJSON() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...self } = this;
    return self;
  }
}
