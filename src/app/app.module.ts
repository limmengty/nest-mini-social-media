import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/modules/user/user.module';
import { PostModule } from 'src/modules/post/post.module';
import { CommentModule } from 'src/modules/comment/comment.module';
import { TimeoutInterceptor } from 'src/modules/common/interceptor/timeout.interceptor';
import { LoggingInterceptor } from 'src/modules/common/interceptor/logging.interceptor';
import { CommonModule } from 'src/modules/common/common.module';
import { JwtAuthGuard } from 'src/modules/common/guard/jwt.guard';
import { RolesGuard } from 'src/modules/common/guard/roles.guard';
import { AuthModule } from 'src/modules/auth/auth.module';
// import { TransformationInterceptor } from 'src/modules/common/interceptor/response.interceptor';
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log(configService.get<string>('DB_TYPE'));
        if (process.env.NODE_ENV === 'development') {
          return {
            type: configService.get<string>('DB_TYPE'),
            host: configService.get<string>('DB_HOST'),
            port: configService.get<string>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_DATABASE'),
            entities: [__dirname + './../**/**.entity{.ts,.js}'],
            subscribers: [__dirname + './../**/**/*.subscriber.{ts,js}'],
            synchronize: configService.get<string>('DB_SYNC'),
            retryAttempts: 20,
          } as TypeOrmModuleAsyncOptions;
        }
        if (process.env.NODE_ENV === 'production') {
          /**
           * Use database url in production instead
           */
          return {
            type: configService.get<string>('DB_TYPE'),
            url: configService.get<string>('DATABASE_URL'),
            entities: [__dirname + './../**/**.entity{.ts,.js}'],
            subscribers: [__dirname + './../**/**/*.subscriber.{ts,js}'],
            synchronize: configService.get('DB_SYNC'),
            ssl: true,
            retryAttempts: 20,
            extra: {
              ssl: {
                rejectUnauthorized: false,
              },
            },
          } as TypeOrmModuleAsyncOptions;
        }
      },
    }),
    AuthModule,
    UserModule,
    CommonModule,
    PostModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: TransformationInterceptor,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
