import {  Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RedisModule} from 'nestjs-redis';

const redisOptions = {
  host: 'localhost', //process.env.REDIS_HOST,
  port: 6379, //parseInt(process.env.REDIS_PORT),
  // db: parseInt(process.env.REDIS_DB),
  // password: process.env.REDIS_PASSWORD,
  // keyPrefix: process.env.REDIS_PRIFIX,
}


@Module({
  imports: [
    RedisModule.register(redisOptions),
    AuthModule, 
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
