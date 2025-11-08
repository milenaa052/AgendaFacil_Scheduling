import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SchedulingCustomerStatus } from '../schedulingCustomer.model';

export class UpdateSchedulingCustomerDto {
    @IsOptional() @IsNumber() companyId?: number;
    @IsOptional() @IsNumber() customerId?: number;
    @IsOptional() @IsString() title?: string;
    @IsOptional() @IsDateString() startDate?: string;
    @IsOptional() @IsDateString() endDate?: string;
    @IsOptional() @IsString() startHour?: string;
    @IsOptional() @IsString() endHour?: string;
    @IsOptional() @IsEnum(SchedulingCustomerStatus) status?: SchedulingCustomerStatus;
}