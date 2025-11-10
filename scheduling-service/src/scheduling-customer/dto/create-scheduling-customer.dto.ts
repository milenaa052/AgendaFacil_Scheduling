import { IsDateString, IsString, IsNumber } from 'class-validator';

export class CreateSchedulingCustomerDto {
    @IsNumber() companyId: number;
    @IsNumber() customerId: number;
    @IsString() title: string;
    @IsDateString() startDate: string;
    @IsDateString() endDate: string;
    @IsString() startHour: string;
    @IsString() endHour: string;
}