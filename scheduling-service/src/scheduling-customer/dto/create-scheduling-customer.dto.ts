import { IsString, IsNumber } from 'class-validator';

export class CreateSchedulingCustomerDto {
    @IsNumber() companyId: number;
    @IsNumber() customerId: number;
    @IsString() title: string;
    @IsString() startDate: string;
    @IsString() endDate: string;
    @IsString() startHour: string;
    @IsString() endHour: string;
}