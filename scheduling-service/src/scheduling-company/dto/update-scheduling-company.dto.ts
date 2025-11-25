import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SchedulingCompanyStatus } from '../schedulingCompany.model';

export class UpdateSchedulingCompanyDto {
    @IsOptional() @IsNumber() companyId?: number;
    @IsOptional() @IsNumber() customerId?: number;
    @IsOptional() @IsNumber() schedulingCustomerId?: number;
    @IsOptional() @IsString() title?: string;
    @IsOptional() @IsString() startDate?: string;
    @IsOptional() @IsString() endDate?: string;
    @IsOptional() @IsString() startHour?: string;
    @IsOptional() @IsString() endHour?: string;
    @IsOptional() @IsNumber() budget?: number;
    @IsOptional() @IsEnum(SchedulingCompanyStatus) status?: SchedulingCompanyStatus;
    @IsOptional() @IsBoolean() notificationSent?: boolean;
    @IsOptional() @IsDateString() lastExtension?: Date;
}