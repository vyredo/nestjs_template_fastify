
import { Controller, Req, Post, UseGuards, Body, ValidationPipe, UsePipes, UseInterceptors, Header, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { Request } from 'express';
import { User, Role } from '../users/user.entity';


export class LoginDTO {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class ValidateTokenDTO {
    // validateToken, token is in header
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsNumber()
    @IsNotEmpty()
    role?: Role; // 100000 -> admin, 1000000 -> superadmin
}

export class ChangeRoleDTO extends ValidateTokenDTO{
    @IsNumber()
    @IsNotEmpty()
    role?: Role; // 100000 -> admin, 1000000 -> superadmin
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(AuthGuard('local'))
    @UsePipes(new ValidationPipe())
    @Post('/login')
    async login(@Req() req, @Body() user: LoginDTO) {
        const _user = await this.authService.login(user);
        if(_user) return _user;
        throw new Error('login failed');
    }

    @UsePipes(new ValidationPipe())
    @Post('/validateToken')
    async validateToken(@Req() req: Request, @Body() dto: ValidateTokenDTO) :  Promise<200|401|403|400>{
        const token:string | undefined = req.header('xtoken');
        if(!token) throw new BadRequestException('token not found');

        const result = await this.authService.validateToken(token, dto.username, dto.role);
        return result;
    }

    
}