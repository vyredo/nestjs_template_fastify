import { Controller, UsePipes, ValidationPipe, Post, Req, Body } from '@nestjs/common';
import { ChangeRoleDTO } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from './users.service';
import { Request } from 'express';

@Controller('users')
export class UsersController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UsersService
    ){}

    @UsePipes(new ValidationPipe())
    @Post('/role/change')
    async changeRole(@Req() req: Request, @Body() dto: ChangeRoleDTO) :  Promise<boolean>{
        const token:string | undefined = req.header('xtoken');

        await this.authService.validateTokenT(token, dto.username, dto.role);
        
        return await this.userService.changeRole(dto.role) ;
    }
}
