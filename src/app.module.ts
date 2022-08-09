import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Dhis2Module } from './dhis2/dhis2.module';
import { LoggingModule } from './logging/logging.module';
import { OpenHimService } from './open-him/open-him.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    Dhis2Module,
    LoggingModule,
  ],
  controllers: [AppController],
  providers: [AppService, OpenHimService],
})
export class AppModule {}
