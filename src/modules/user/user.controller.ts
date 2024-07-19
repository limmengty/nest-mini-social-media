import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserEntity } from './entity/user.entity';
import { RegisterPayload } from '../auth/payloads/register.payload';
import { PostEntity } from '../post/entity/post.entity';
import { ResponseMessage } from '../common/decorator/response_message.decorator';
import { TransformationInterceptor } from '../common/interceptor/response.interceptor';
import { UpdatePayload } from '../post/payloads/update.user.payload';

@Controller('api/v1/user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Get User By Id' })
  async getUser(@Param('id') id: string): Promise<UserEntity> {
    return await this.userService.get(id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Get All Users' })
  async getAllUser(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<any> {
    return await this.userService.getAllUser({ page, limit });
  }

  @Post()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Create User' })
  async createUser(@Body() payload: RegisterPayload): Promise<UserEntity> {
    return await this.userService.createUser(payload);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Deleted User By Id' })
  async deleteUser(@Param('id') id: string): Promise<UserEntity> {
    return await this.userService.deleteUser(id);
  }

  @Put('restore/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Restored User By Id' })
  async restoreUser(@Param('id') id: string): Promise<UserEntity> {
    return await this.userService.restoreUser(id);
  }

  @Get(':id/posts')
  @ResponseMessage('Fetched User Succesfully')
  @UseInterceptors(TransformationInterceptor)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Get Post By User Id' })
  async getPostByUser(@Param('id') id: string): Promise<PostEntity[]> {
    return await this.userService.getPostByUserId(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Updated User By Id' })
  async updateUserById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdatePayload,
  ) {
    return this.userService.update(id, payload);
  }
}
