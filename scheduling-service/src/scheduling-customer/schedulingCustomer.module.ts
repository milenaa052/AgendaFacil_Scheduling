import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SchedulingCustomer } from './schedulingCustomer.model';
import { SchedulingCustomerService } from './schedulingCustomer.service';
import { SchedulingCustomerController } from './schedulingCustomer.controller';
import { HttpModule } from 'src/http/http.module';
import { HttpService } from 'src/http/http.service';

@Module({
    imports: [SequelizeModule.forFeature([SchedulingCustomer]), HttpModule],
    controllers: [SchedulingCustomerController],
    providers: [SchedulingCustomerService, HttpService],
    exports: [SchedulingCustomerService],
})

export class SchedulingCustomerModule {}