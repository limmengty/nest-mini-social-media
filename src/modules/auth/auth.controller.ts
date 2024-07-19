import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { Public } from '../common/decorator/public.decorator';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginPayload } from './payloads/login.payload';
import { JwtAuthGuard } from '../common/guard/jwt.guard';
import RequestWithUser from '../common/interface/request-with-user.interface';
import { RegisterEmailPayload } from './payloads/register-email.payload';

@Controller('/api/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @ApiResponse({ status: 201, description: 'Successful Login' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() payload: LoginPayload): Promise<any> {
    const user = await this.authService.validateUser(payload);
    const tokens = await this.authService.getTokens(user.id);
    await this.authService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  @Post('/register')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a user' })
  @ApiForbiddenResponse({
    status: 403,
    description: 'Forbidden',
  })
  async registerUser(@Body() payload: RegisterEmailPayload) {
    return this.authService.register(payload);
  }

  /**
   * Get request's user info
   * @param request express request
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOkResponse({ description: 'Successful Response' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getLoggedInUser(@Req() req: RequestWithUser): Promise<any> {
    return req.user;
  }
}
