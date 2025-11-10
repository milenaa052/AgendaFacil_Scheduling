import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SchedulingCustomerStatus } from '../schedulingCustomer.model';

export class UpdateSchedulingCustomerDto {
    @IsOptional() @IsNumber() companyId?: number;
    @IsOptional() @IsNumber() customerId?: number;
    @IsOptional() @IsString() title?: string;
    @IsOptional() @IsString() startDate?: string;
    @IsOptional() @IsString() endDate?: string;
    @IsOptional() @IsString() startHour?: string;
    @IsOptional() @IsString() endHour?: string;
    @IsOptional() @IsEnum(SchedulingCustomerStatus) status?: SchedulingCustomerStatus;
}