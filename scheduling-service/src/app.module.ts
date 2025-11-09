import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { SchedulingCompanyModule } from './scheduling-company/schedulingCompany.module';
import { SchedulingCustomerModule } from './scheduling-customer/schedulingCustomer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5434,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'schedulingdb',
      autoLoadModels: true,
      synchronize: true,
      logging: false,
    }),
    SchedulingCompanyModule,
    SchedulingCustomerModule
  ],
})
export class AppModule {}