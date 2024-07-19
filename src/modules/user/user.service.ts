import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotAcceptableException,
  Param,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { Repository } from 'typeorm';
import { RegisterPayload } from '../auth/payloads/register.payload';
import { PostEntity } from '../post/entity/post.entity';
import { CommentEntity } from '../comment/entity/comment.entity';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { UsersTypeEnum } from '../common/enum/user_type.enum';
import { UpdatePayload } from '../post/payloads/update.user.payload';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}
  private readonly logger = new Logger(UserService.name);
  async get(id: string) {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new HttpException('User NotFound', HttpStatus.NOT_FOUND);
      }
      return user;
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

  async getAllUser(
    options: IPaginationOptions,
  ): Promise<Pagination<UserEntity>> {
    try {
      const query = this.userRepository.createQueryBuilder('p');
      query.orderBy('p.updated_at', 'DESC');
      return paginate<UserEntity>(query, options);
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

  async getByUsername(username: string) {
    return this.userRepository.findOneBy({ username: username });
  }
  async saveUser(
    payload: RegisterPayload,
    type: UsersTypeEnum,
    picture: string,
  ): Promise<UserEntity> {
    return await this.userRepository.save(
      this.userRepository.create({
        ...payload,
        username: payload.firstname + Date.now().toString(),
        registrationType: type,
        picture: picture,
        // password: hashedPassword,
      }),
    );
  }
  async createUser(payload: RegisterPayload) {
    try {
      const user = await this.getByUsername(payload.username);

      if (user) {
        throw new NotAcceptableException(
          'Admin with provide username already created',
        );
      }
      return await this.userRepository.save(
        this.userRepository.create(payload),
      );
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

  async deleteUser(@Param() id: string): Promise<any> {
    try {
      const user = await this.userRepository.findOneBy({ id });
      console.log(user);
      const deleted = await this.userRepository.softDelete(id);

      if (deleted.affected === 1) {
        return { message: `Deleted ${user.username} from records` };
      } else {
        throw new BadRequestException(
          `Failed to delete a profile by the name of ${user.username}.`,
        );
      }
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
  async restoreUser(@Param() id: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        withDeleted: true,
        where: { id: id },
      });
      console.log(user);
      if (!user.deleted_at) {
        throw new HttpException(
          'User is not deleted',
          HttpStatus.NOT_ACCEPTABLE,
        );
      }

      if (!user) {
        throw new HttpException('User NotFound', HttpStatus.NOT_FOUND);
      }
      const restored = await this.userRepository.restore(id);

      if (restored.affected === 1) {
        return { message: `Restored ${user.username} from records` };
      } else {
        throw new BadRequestException(
          `Failed to Restored a profile by the name of ${user.username}.`,
        );
      }
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
  async getPostByUserId(id: string) {
    try {
      const post = this.postRepository
        .createQueryBuilder('user')
        .where('user.byUser = :id', { id: id })
        .getMany();
      if (!post) {
        throw new HttpException('NotFound', HttpStatus.NOT_FOUND);
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

  async update(id: string, updatePayload: UpdatePayload): Promise<any> {
    const admin = await this.userRepository.findOne({
      where: { id: id },
    });
    const updated = Object.assign(admin, updatePayload);
    delete updated.password;
    try {
      return await this.userRepository.save(updated);
    } catch (e) {
      throw new NotAcceptableException('Username or Email already exists!');
    }
  }
}
