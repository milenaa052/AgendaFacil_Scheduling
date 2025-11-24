import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateSchedulingCompanyDto {
    @IsNumber() companyId: number;
    @IsNumber() customerId: number;
    @IsNumber() schedulingCustomerId: number;
    @IsString() title: string;
    @IsString() startDate: string;
    @IsString() endDate: string;
    @IsString() startHour: string;
    @IsString() endHour: string;
    @IsOptional() @IsDateString() lastExtension: Date;
}