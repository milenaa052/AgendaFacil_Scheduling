import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SchedulingCompany } from './schedulingCompany.model';
import { SchedulingCompanyService } from './schedulingCompany.service';
import { SchedulingCompanyController } from './schedulingCompany.controller';
import { HttpModule } from 'src/http/http.module';
import { HttpService } from 'src/http/http.service';

@Module({
    imports: [SequelizeModule.forFeature([SchedulingCompany]), HttpModule],
    controllers: [SchedulingCompanyController],
    providers: [SchedulingCompanyService, HttpService],
    exports: [SchedulingCompanyService ],
})

export class SchedulingCompanyModule {}