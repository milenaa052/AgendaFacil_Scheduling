import { IsString, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { SchedulingCompanyStatus } from '../schedulingCompany.model'

export class CreateSchedulingCompanyDto {
    @IsNumber() companyId: number;
    @IsOptional() @IsNumber() customerId: number;
    @IsOptional() @IsNumber() schedulingCustomerId: number;
    @IsString() title: string;
    @IsString() startDate: string;
    @IsString() endDate: string;
    @IsString() startHour: string;
    @IsString() endHour: string;
    @IsOptional() @IsString() repeatScheduling: string;
    @IsOptional() @IsNumber() budget: number;
    @IsEnum(SchedulingCompanyStatus) status: SchedulingCompanyStatus;
    @IsOptional() @IsDateString() lastExtension: Date;
}