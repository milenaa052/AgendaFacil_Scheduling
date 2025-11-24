import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SchedulingCustomer } from './schedulingCustomer.model';
import { SchedulingCustomerService } from './schedulingCustomer.service';
import { SchedulingCustomerController } from './schedulingCustomer.controller';
import { HttpModule } from 'src/http/http.module';
import { HttpService } from 'src/http/http.service';
import { SchedulingCompanyModule } from 'src/scheduling-company/schedulingCompany.module';

const CustomerSequelizeModule = SequelizeModule.forFeature([SchedulingCustomer]);

@Module({
    imports: [
        CustomerSequelizeModule, 
        HttpModule, 
        forwardRef(() => SchedulingCompanyModule)
    ],
    controllers: [SchedulingCustomerController],
    providers: [SchedulingCustomerService, HttpService],
    exports: [
        SchedulingCustomerService,
        CustomerSequelizeModule
    ],
})

export class SchedulingCustomerModule {}