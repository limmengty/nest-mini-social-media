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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PostService } from './post.service';
// import { CreatePostPayload } from './payloads/create.post.payload';
import { PostEntity } from './entity/post.entity';
import { UserService } from '../user/user.service';
import { UpdatePostPayload } from './payloads/update.post.payload';
// import { CommentEntity } from '../comment/entity/comment.entity';
import { ResponseMessage } from '../common/decorator/response_message.decorator';
import { CreatePostPayload } from './payloads/create.post.payload';

@Controller('api/v1/post')
@ApiTags('Post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Get All Posts' })
  async getAllPost(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<any> {
    return this.postService.getAllPost({ page, limit });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Get Post by Id' })
  async getPostById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.postService.getPostById(id);
  }

  @Post(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Created Posts By User Id' })
  async createPostByUser(
    @Param('id') id: string,
    @Body() payload: CreatePostPayload,
  ): Promise<PostEntity> {
    return this.postService.createPostByUser({ byUser: id, ...payload });
  }

  @Get(':id/post')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Get Comment By Post Id' })
  @ResponseMessage('Fetched Comment Succesfully')
  async getCommentByPostId(@Param('id') id: string) {
    return this.postService.getCommentByPostId(id);
  }

  @Put(':uid/user/:pid/post')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Updated Post By Post Id and User Id' })
  async updatePost(
    @Param('uid', new ParseUUIDPipe()) uid: string,
    @Param('pid', new ParseUUIDPipe()) pid: string,
    @Body() payload: UpdatePostPayload,
  ): Promise<PostEntity> {
    return this.postService.updatePostByOwnPost({
      byUser: uid,
      byPost: pid,
      ...payload,
    });
  }

  @Delete(':uid/user/:pid/post')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Deleted Post By Post Id and User Id' })
  async deletePostByUser(
    @Param('uid', new ParseUUIDPipe()) uip: string,
    @Param('pid', new ParseUUIDPipe()) pid: string,
  ) {
    return this.postService.deletePostByOwnPost(uip, pid);
  }

  @Put('restore/:uid/user/:pid/post')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Restored Post By Post Id and User Id' })
  async restorePostByUser(
    @Param('uid', new ParseUUIDPipe()) uip: string,
    @Param('pid', new ParseUUIDPipe()) pid: string,
  ) {
    return this.postService.restorePostByOwnPost(uip, pid);
  }
}
