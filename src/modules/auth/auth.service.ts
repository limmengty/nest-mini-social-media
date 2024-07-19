import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginPayload } from './payloads/login.payload';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersTypeEnum } from '../common/enum/user_type.enum';
import { Hash } from 'src/utils/Hash';
import { RegisterEmailPayload } from './payloads/register-email.payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  // async createToken(user: UserEntity) {
  //   return {
  //     expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME'),
  //     accessToken: this.jwtService.sign({ id: user.id }),
  //     // user,
  //   };
  // }
  async validateUser(payload: LoginPayload): Promise<UserEntity> {
    const user = await this.userService.getByUsername(payload.username);
    if (!user || !Hash.compare(payload.password, user.password)) {
      throw new UnauthorizedException('Username or Password is not correct!');
    }

    if (user.registrationType == UsersTypeEnum.SSO) {
      throw new UnauthorizedException('UAuth User not allowed here!');
    }
    return user;
  }
  async register(payload: RegisterEmailPayload) {
    const email = payload.email;
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
    if (user) {
      throw new BadRequestException('user_already_existed');
    }
    // const hashedPassword = Hash.make(payload.password);
    const final = await this.userService.saveUser(
      payload,
      UsersTypeEnum.PASSWORD,
      null,
    );
    /**
     * Create and Persist Refresh Token
     */
    const tokens = await this.getTokens(final.id);
    await this.updateRefreshToken(final.id, tokens.refreshToken);
    return tokens;
  }

  async getTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: userId,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: Number(this.configService.get('JWT_EXPIRATION_TIME')),
        },
      ),
      this.jwtService.signAsync(
        {
          id: userId,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: Number(
            this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
          ),
        },
      ),
    ]);
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashRefreshToken = Hash.make(refreshToken);
    await this.userRepository.update(userId, {
      refreshToken: hashRefreshToken,
    });
  }
}
