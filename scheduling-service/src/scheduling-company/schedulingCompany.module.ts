import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SchedulingCompany } from './schedulingCompany.model';
import { SchedulingCompanyService } from './schedulingCompany.service';
import { SchedulingCompanyController } from './schedulingCompany.controller';

@Module({
    imports: [SequelizeModule.forFeature([SchedulingCompany])],
    controllers: [SchedulingCompanyController],
    providers: [SchedulingCompanyService],
    exports: [SchedulingCompanyService],
})

export class SchedulingCompanyModule {}