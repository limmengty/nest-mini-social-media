import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './entity/post.entity';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entity/user.entity';
import { UpdatePostPayload } from './payloads/update.post.payload';
import { CommentEntity } from '../comment/entity/comment.entity';
import { CreatePostPayload } from './payloads/create.post.payload';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class PostService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}
  private readonly logger = new Logger(PostService.name);
  async getAllPost(
    options: IPaginationOptions,
  ): Promise<Pagination<PostEntity>> {
    try {
      const query = this.postRepository.createQueryBuilder('p');
      query.orderBy('p.updated_at', 'DESC');
      const result = paginate<PostEntity>(query, options);

      if (!result) {
        throw new HttpException('Post NotFound', HttpStatus.NOT_FOUND);
      }
      return result;
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
  async getPostById(id: string): Promise<PostEntity> {
    try {
      const post = await this.postRepository.findOne({ where: { id: id } });
      this.logger.log(post);
      if (!post) {
        throw new HttpException('Post NotFound', HttpStatus.NOT_FOUND);
      }
      return post;
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

  async getUserByPost(): Promise<PostEntity[]> {
    try {
      const result = await this.postRepository.find({
        relations: ['user'],
      });

      if (!result) {
        throw new NotFoundException('User post not found!');
      }
      return result;
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

  async getCommentByPostId(id: string) {
    try {
      const comment = this.commentRepository
        .createQueryBuilder('post')
        .where('post.byPost = :id', { id: id })
        .getMany();
      if (!comment) {
        throw new HttpException('Comment not found!', HttpStatus.NOT_FOUND);
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

  async updatePostByOwnPost(
    payload: UpdatePostPayload & { byUser: string; byPost: string },
  ): Promise<PostEntity> {
    try {
      const { byPost, byUser, content } = payload;
      const post = await this.postRepository.findOne({
        where: { id: byPost },
        relations: ['byUser'],
      });
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      this.logger.log(post.byUser);
      // Check if the current user is the owner of the post
      if (post.byUser.id !== byUser) {
        throw new HttpException(
          'You are not the owner of this post',
          HttpStatus.NOT_FOUND,
        );
      }
      // Update the post content
      post.content = content;
      await this.postRepository.save(post);
      return post;
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

  async createPostByUser(payload: CreatePostPayload & { byUser: string }) {
    try {
      // extract payload
      const { byUser, content } = payload;
      const user = await this.userRepository.findOne({
        where: { id: byUser },
      });

      if (!user) {
        throw new HttpException('User NotFound', HttpStatus.NOT_FOUND);
      }
      // create new post
      const newPost = this.postRepository.create({
        content,
        byUser: user,
      });

      // save post to db
      const savedPost = await this.postRepository.save(newPost);
      const newUser = [];
      newUser.push(user.posts);

      // push user id to post
      newUser.push(savedPost);
      await this.userRepository.save(user);

      return savedPost;
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

  async deletePostByOwnPost(
    byUser: string,
    byPost: string,
  ): Promise<PostEntity> {
    try {
      const post = await this.postRepository.findOne({
        where: { id: byPost },
        relations: ['byUser'],
      });
      this.logger.log(byPost);
      const oldPost = await this.postRepository.findOne({
        where: { id: byPost },
      });
      if (!post) {
        throw new HttpException('Post NotFound', HttpStatus.NOT_FOUND);
      }
      this.logger.log(byUser);
      // Check if the current user is the owner of the post
      if (post.byUser.id !== byUser) {
        throw new HttpException(
          'You are not the owner of this post',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      await this.postRepository.softDelete({ id: byPost });
      return oldPost;
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

  async restorePostByOwnPost(
    byUser: string,
    byPost: string,
  ): Promise<PostEntity> {
    try {
      const post = await this.postRepository.findOne({
        where: { id: byPost },
        withDeleted: true,
        relations: ['byUser'],
      });
      this.logger.log(byPost);
      const oldPost = await this.postRepository.findOne({
        where: { id: byPost },
      });
      if (!post.deleted_at) {
        throw new HttpException(
          'Post is not deleted',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      if (!post) {
        throw new HttpException('Post NotFound', HttpStatus.NOT_FOUND);
      }
      this.logger.log(byUser);
      // Check if the current user is the owner of the post
      if (post.byUser.id !== byUser) {
        throw new HttpException(
          'You are not the owner of this post',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }
      await this.postRepository.restore({ id: byPost });
      return oldPost;
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
