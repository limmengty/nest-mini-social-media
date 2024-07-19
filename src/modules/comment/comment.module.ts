import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { JwtModule } from '@nestjs/jwt';
import { CommentEntity } from './entity/comment.entity';
import { UserEntity } from '../user/entity/user.entity';
import { PostEntity } from '../post/entity/post.entity';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { UserService } from '../user/user.service';
import { PostService } from '../post/post.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, PostEntity, CommentEntity]),
    // PassportModule.register({ defaultStrategy: 'jwt' }),
    // JwtModule.register({}),
  ],
  exports: [CommentService],
  controllers: [CommentController],
  providers: [CommentService, UserService, PostService],
})
export class CommentModule {}
