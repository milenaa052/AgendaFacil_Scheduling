import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SchedulingCustomerStatus } from '../schedulingCustomer.model';

export class UpdateSchedulingCustomerDto {
    @ApiPropertyOptional({
        description: 'ID da empresa',
        example: 1,
        type: Number,
    })
    @IsOptional() 
    @IsNumber() 
    companyId?: number;

    @ApiPropertyOptional({
        description: 'ID do cliente',
        example: 10,
        type: Number,
    })
    @IsOptional() 
    @IsNumber() 
    customerId?: number;

    @ApiPropertyOptional({
        description: 'ID do agendamento da empresa',
        example: 5,
        type: Number,
    })
    @IsOptional() 
    @IsNumber() 
    schedulingCompanyId?: number;

    @ApiPropertyOptional({
        description: 'Título do agendamento',
        example: 'Consulta Médica',
        type: String,
    })
    @IsOptional() 
    @IsString() 
    title?: string;

    @ApiPropertyOptional({
        description: 'Data de início do agendamento (formato: YYYY-MM-DD)',
        example: '2025-11-25',
        type: String,
    })
    @IsOptional() 
    @IsString() 
    startDate?: string;

    @ApiPropertyOptional({
        description: 'Data de término do agendamento (formato: YYYY-MM-DD)',
        example: '2025-11-25',
        type: String,
    })
    @IsOptional() 
    @IsString() 
    endDate?: string;

    @ApiPropertyOptional({
        description: 'Hora de início (formato: HH:MM)',
        example: '09:00',
        type: String,
    })
    @IsOptional() 
    @IsString() 
    startHour?: string;

    @ApiPropertyOptional({
        description: 'Hora de término (formato: HH:MM)',
        example: '10:00',
        type: String,
    })
    @IsOptional() 
    @IsString() 
    endHour?: string;

    @ApiPropertyOptional({
        description: 'Status do agendamento',
        enum: SchedulingCustomerStatus,
        example: SchedulingCustomerStatus.CONFIRMED,
    })
    @IsOptional() 
    @IsEnum(SchedulingCustomerStatus) 
    status?: SchedulingCustomerStatus;
}