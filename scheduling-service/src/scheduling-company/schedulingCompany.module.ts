import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SchedulingCompany } from './schedulingCompany.model';
import { SchedulingCompanyService } from './schedulingCompany.service';
import { SchedulingCheckService } from './scheduling-check.service';
import { SchedulingCompanyController } from './schedulingCompany.controller';
import { HttpModule } from 'src/http/http.module';
import { HttpService } from 'src/http/http.service';
import { SchedulingCustomerModule } from 'src/scheduling-customer/schedulingCustomer.module';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';

const CompanySequelizeModule = SequelizeModule.forFeature([SchedulingCompany]);

@Module({
    imports: [
        CompanySequelizeModule, 
        HttpModule, 
        forwardRef(() => SchedulingCustomerModule),
        RedisModule
    ],
    controllers: [SchedulingCompanyController],
    providers: [SchedulingCompanyService, HttpService, SchedulingCheckService, RedisService],
    exports: [
        SchedulingCompanyService,
        CompanySequelizeModule
    ],
})

export class SchedulingCompanyModule {}