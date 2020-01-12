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
    async changeRole(@Req() req: Request, @Body() dto: ChangeRoleDTO) :  Promise<200|401|403|400>{
        const token:string | undefined = req.header('xtoken');

        const statusValid = await this.authService.validateToken(token, dto.username, dto.role);
        if(statusValid !== 200) return statusValid;
        
        return await this.userService.changeRole(dto.role) === true ? 200 : 400;
    }
}
