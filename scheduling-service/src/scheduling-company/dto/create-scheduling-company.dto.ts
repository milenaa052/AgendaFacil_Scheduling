import { IsDateString, IsString, IsNumber } from 'class-validator';

export class CreateSchedulingCompanyDto {
    @IsNumber() companyId: number;
    @IsNumber() customerId: number;
    @IsString() title: string;
    @IsDateString() startDate: string;
    @IsDateString() endDate: string;
    @IsNumber() startHour: string;
    @IsString() endHour: string;
}