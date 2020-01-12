
import { Controller, Request, Post, UseGuards, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { IsString, IsNotEmpty } from 'class-validator';


class LoginDTO {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

class tokenDTO {
    @IsString()
    @IsNotEmpty()
    token: string;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(AuthGuard('local'))
    @UsePipes(new ValidationPipe())
    @Post('/login')
    async login(@Request() req, @Body() user: LoginDTO) {
        const token: { access_token:string } = await this.authService.login(user)
        // put token to redis
        return token;
    }

    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ValidationPipe())
    @Post('/validate')
    async validateToken(@Request() req, @Body() token: tokenDTO) {
        // get token from redis
        const tokenRedis = null;
        return tokenRedis === token.token;
    }
}