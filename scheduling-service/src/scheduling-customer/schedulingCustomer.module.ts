import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SchedulingCustomer } from './schedulingCustomer.model';
import { SchedulingCustomerService } from './schedulingCustomer.service';
import { SchedulingCustomerController } from './schedulingCustomer.controller';

@Module({
    imports: [SequelizeModule.forFeature([SchedulingCustomer])],
    controllers: [SchedulingCustomerController],
    providers: [SchedulingCustomerService],
    exports: [SchedulingCustomerService],
})

export class SchedulingCustomerModule {}