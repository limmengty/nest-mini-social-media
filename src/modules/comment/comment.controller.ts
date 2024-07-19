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
import { CommentService } from './comment.service';
import { Public } from '../common/decorator/public.decorator';
import { ResponseMessage } from '../common/decorator/response_message.decorator';
import { CommentPostPayload } from './payloads/comment.post.payload';
import { CommentUpdatePayload } from './payloads/comment.update.payload';
import { CommentEntity } from './entity/comment.entity';

@Controller('api/v1/comments')
@ApiTags('Comments')
@Public()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Find Comment By Id' })
  async getCommentById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.commentService.getCommentById(id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Find All Comments' })
  async getAllComment(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<any> {
    return await this.commentService.getAllComment({ page, limit });
  }

  @Get(':id/user')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Find Comment By User Id' })
  @ResponseMessage('get comment by user')
  async getCommentByUser(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<any> {
    return await this.commentService.getCommentByUser(id);
  }

  @Get(':id/post')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Find Comment By Post Id' })
  @ResponseMessage('get comment by user')
  async getCommentByPost(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<any> {
    return await this.commentService.getCommentByPost(id);
  }

  @Post(':uid/user/:pid/post')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Created Comment By User Id and Post Id' })
  async createPostByUser(
    @Param('uid', new ParseUUIDPipe()) uid: string,
    @Param('pid', new ParseUUIDPipe()) pid: string,
    @Body() payload: CommentPostPayload,
  ) {
    const newPayload = { byUser: uid, byPost: pid, ...payload };
    const result = await this.commentService.createCommentByUser(newPayload);
    console.log(result);
    return result;
  }

  @Delete(':uid/user/:cid/comment')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Deleted Comment By User Id and Post Id' })
  async deleteCommentByOwnComment(
    @Param('uid', new ParseUUIDPipe()) uid: string,
    @Param('cid', new ParseUUIDPipe()) cid: string,
  ) {
    return this.commentService.deleteCommentByOwnComment(uid, cid);
  }

  @Put('restore/:uid/user/:cid/comment')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Restored Comment By User Id and Post Id' })
  async restoreCommentByOwnComment(
    @Param('uid', new ParseUUIDPipe()) uid: string,
    @Param('cid', new ParseUUIDPipe()) cid: string,
  ) {
    return this.commentService.restoreCommentByOwnComment(uid, cid);
  }

  @Put(':uid/user/:cid/comment')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOperation({ summary: 'Updated Comment By Post Id and User Id' })
  async updateComment(
    @Param('uid', new ParseUUIDPipe()) uid: string,
    @Param('cid', new ParseUUIDPipe()) cid: string,
    @Body() payload: CommentUpdatePayload,
  ): Promise<CommentEntity> {
    return this.commentService.updateCommetByOwnComment({
      byUser: uid,
      byComment: cid,
      ...payload,
    });
  }
}
