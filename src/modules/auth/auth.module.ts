import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from '../common/strategy/jwt.strategy';
import { RefreshTokenStrategy } from '../common/strategy/refresh-token.strategy';

@Module({
  imports: [
    UserModule,
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({}),

    // PassportModule.register({ defaultStrategy: 'jwt' }),
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => {
    //     return {
    //       secret: configService.get<string>('JWT_SECRET_KEY'),
    //       signOptions: {
    //         ...(configService.get<string>('JWT_EXPIRATION_TIME')
    //           ? {
    //               expiresIn: Number(configService.get('JWT_EXPIRATION_TIME')),
    //             }
    //           : {}),
    //       },
    //     };
    //   },
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
  // exports: [PassportModule.register({ defaultStrategy: 'jwt' })],
})
export class AuthModule {}
