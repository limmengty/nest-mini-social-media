import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entity/post.entity';
import { JwtModule } from '@nestjs/jwt';
import { CommentEntity } from '../comment/entity/comment.entity';
import { UserEntity } from '../user/entity/user.entity';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, PostEntity, CommentEntity]),
    // PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  exports: [PostService],
  controllers: [PostController],
  providers: [PostService, UserService],
})
export class PostModule {}
