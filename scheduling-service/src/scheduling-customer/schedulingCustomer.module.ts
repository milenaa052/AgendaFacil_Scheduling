import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SchedulingCustomer } from './schedulingCustomer.model';
import { SchedulingCustomerService } from './schedulingCustomer.service';
import { SchedulingCustomerController } from './schedulingCustomer.controller';
import { HttpModule } from 'src/http/http.module';
import { HttpService } from 'src/http/http.service';
import { SchedulingCompanyModule } from 'src/scheduling-company/schedulingCompany.module';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';

const CustomerSequelizeModule = SequelizeModule.forFeature([SchedulingCustomer]);

@Module({
    imports: [
        CustomerSequelizeModule, 
        HttpModule, 
        forwardRef(() => SchedulingCompanyModule),
        RedisModule
    ],
    controllers: [SchedulingCustomerController],
    providers: [SchedulingCustomerService, HttpService, RedisService],
    exports: [
        SchedulingCustomerService,
        CustomerSequelizeModule
    ],
})

export class SchedulingCustomerModule {}