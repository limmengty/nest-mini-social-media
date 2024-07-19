import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './entity/comment.entity';
import { CommentPostPayload } from './payloads/comment.post.payload';
import { PostEntity } from '../post/entity/post.entity';
import { UserEntity } from '../user/entity/user.entity';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { CommentUpdatePayload } from './payloads/comment.update.payload';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  private readonly logger = new Logger(CommentService.name);

  async getCommentById(id: string) {
    try {
      const comment = await this.commentRepository.findOne({
        where: { id: id },
        relations: ['byPost', 'byUser'],
      });

      if (!comment) {
        throw new HttpException('Comment NotFound!', HttpStatus.NOT_FOUND);
      }

      return comment;
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllComment(
    options: IPaginationOptions,
  ): Promise<Pagination<CommentEntity>> {
    try {
      const query = this.commentRepository.createQueryBuilder('p');
      query.orderBy('p.updated_at', 'DESC');
      return paginate<CommentEntity>(query, options);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getCommentByPost(id: string): Promise<any> {
    try {
      const comment = await this.postRepository.findOne({
        where: { id: id },
        relations: ['comments'],
      });
      return comment;
    } catch (e) {
      throw new HttpException(
        'Error while getting user comments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getCommentByUser(id: string): Promise<any> {
    try {
      const comment = await this.userRepository.findOne({
        where: { id: id },
        relations: ['comments'],
      });
      return comment;
    } catch (e) {
      throw new HttpException(
        'Error while getting user comments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // async getAllComment(): Promise<CommentEntity[]> {
  //   return await this.commentRepository.find({});
  // }
  async createCommentByUser(
    payload: CommentPostPayload & { byUser: string; byPost: string },
  ) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: payload.byUser },
        // relations: ['comments'],
      });
      const post = await this.postRepository.findOne({
        where: { id: payload.byPost },
        // relations: ['posts'],
      });
      this.logger.log(user.id);
      this.logger.log(post.id);
      const newComment = await this.commentRepository.save(
        this.commentRepository.create({
          message: payload.message,
          byPost: post.id,
          byUser: user,
        }),
      );

      if (user) {
        const arr = [];
        arr.push(user.comments);
        arr.push(newComment.byUser);
        await this.userRepository.save(user);
      }

      if (post) {
        const arr = [];
        arr.push(post.comments);
        arr.push(newComment.byPost);
        await this.postRepository.save(post);
      }

      console.log(newComment);
      // return user;
      return newComment;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async deleteCommentByOwnComment(
    byUser: string,
    byComment: string,
  ): Promise<CommentEntity> {
    try {
      const comment = await this.commentRepository.findOne({
        where: { id: byComment },
        relations: ['byUser'],
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      const oldComment = await this.commentRepository.findOne({
        where: { id: byComment },
      });
      this.logger.log(comment.byUser.id);
      this.logger.log(byUser);
      if (comment.byUser.id !== byUser) {
        throw new NotAcceptableException('You are not the owner of this post');
      }

      await this.commentRepository.softDelete({ id: comment.id });
      return oldComment;
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      console.log(e);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async restoreCommentByOwnComment(
    byUser: string,
    byComment: string,
  ): Promise<CommentEntity> {
    try {
      const comment = await this.commentRepository.findOne({
        where: { id: byComment },
        withDeleted: true,
        relations: ['byUser'],
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      const oldComment = await this.commentRepository.findOne({
        withDeleted: true,
        where: { id: byComment },
      });
      if (!comment.deleted_at) {
        throw new HttpException(
          'Comment is not deleted',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      // this.logger.log(comment.byUser.id);
      // this.logger.log(byUser);
      if (comment.byUser.id !== byUser) {
        throw new NotAcceptableException('You are not the owner of this post');
      }

      await this.commentRepository.restore({ id: comment.id });
      return oldComment;
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      console.log(e);
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateCommetByOwnComment(
    payload: CommentUpdatePayload & { byComment: string; byUser: string },
  ): Promise<CommentEntity> {
    try {
      const { byComment, byUser, message } = payload;
      const comment = await this.commentRepository.findOne({
        where: { id: byComment },
        relations: ['byUser'],
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }
      this.logger.log(comment.byUser);
      // Check if the current user is the owner of the Comment
      if (comment.byUser.id !== byUser) {
        throw new HttpException(
          'You are not the owner of this Comment',
          HttpStatus.NOT_FOUND,
        );
      }
      // Update the post content
      comment.message = message;
      await this.commentRepository.save(comment);

      const updatedComment = await this.commentRepository.findOne({
        where: { id: byComment },
      });
      return updatedComment;
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
