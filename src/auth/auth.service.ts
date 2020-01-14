
import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'nestjs-redis';
import * as Redis from 'ioredis'
import { LoginDTO } from './auth.controller';
import { User, Role } from 'src/users/user.entity';

interface InMemoryToken {
  username: string;
  validTimestamp: number;
  role: number;
}

interface IAuthService {
  login(user: LoginDTO):  Promise<{validUser: User, access_token: string}>;
  validateTokenT(token:string|undefined, username:string, role: Role | undefined) : Promise<boolean>;
  validateUserT(username: string, pass: string): Promise<User>;
}

// @ts-ignore
const tokenCache: InMemoryToken = {};
const tokenTTL = 6 * 60 * 60 * 1000;

@Injectable()
export class AuthService implements IAuthService {
  private redisClient: Redis.Redis;
  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {
    this.initT()
  }

  public async login(user: LoginDTO): Promise<{validUser: User, access_token: string}>{
    const payload = { username: user.username, sub: user.username };
    const validUser = await this.validateUserT(user.username, user.password);
    const access_token = this.jwtService.sign(payload);

    await this.cacheToRedis(access_token, validUser);  
    this.updateTokenMemory(access_token, validUser);

    return {
      access_token,
      validUser,
    };
  }

  public async validateTokenT(token:string|undefined, username:string, role: Role | undefined) : Promise<boolean>{
    role = role || 1;

    // get from memory or  get from redis and populate in-memory
    let user: InMemoryToken = tokenCache[token];
    if(!user) user = await this.getTokenFromRedis(token);
    if(!user) throw new UnauthorizedException();

    // if compare the username does not match
    // if timestamp or token not valid, return 401
    if(user.username !== username) throw new UnauthorizedException()
    if(user.validTimestamp < new Date().getTime()) throw  new UnauthorizedException();

    // if role is not matched return 403
    if(user.role !== role) throw new ForbiddenException();
    
    // return 200
    return true;
  }

  async validateUserT(username: string, pass: string): Promise<User> {
    const user = await this.usersService.findOne(username);
    if(!user) throw new NotFoundException('user not found');

    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result as User;
    }
    return null;
  }
  
  private async initT(){
    this.redisClient = null; // await this.redisService.getClient();
    if(this.redisClient) throw new Error('redis client is not ready')
  }

  
  private async updateTokenMemory(token:string, {username, role}){
    tokenCache[token] = {
      username, role
    }
  }
  
  private async cacheToRedis(token:string, {username, role}):Promise<boolean>{
    const validTimestamp = new Date().getTime() + tokenTTL;
    const body = JSON.stringify({
      username, role, validTimestamp
    })
    const result = await this.redisClient.set(token, body, 60 * 60 + 's')
    return !!result;
  }

  private async getTokenFromRedis(token: string): Promise<InMemoryToken>{
    const result = await this.redisClient.get(token)
    const body = JSON.parse(result)
    return body;
  } 
}