import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SchedulingCompanyStatus } from '../schedulingCompany.model';

export class UpdateSchedulingCompanyDto {
    @ApiPropertyOptional({ description: 'ID da empresa', example: 1 })
    @IsOptional() 
    @IsNumber() 
    companyId?: number;

    @ApiPropertyOptional({ description: 'ID do cliente', example: 10 })
    @IsOptional() 
    @IsNumber() 
    customerId?: number;

    @ApiPropertyOptional({ description: 'ID do agendamento do cliente', example: 5 })
    @IsOptional() 
    @IsNumber() 
    schedulingCustomerId?: number;

    @ApiPropertyOptional({ description: 'Título do agendamento', example: 'Reunião com cliente' })
    @IsOptional() 
    @IsString() 
    title?: string;

    @ApiPropertyOptional({ description: 'Data de início (YYYY-MM-DD)', example: '2025-11-25' })
    @IsOptional() 
    @IsString() 
    startDate?: string;

    @ApiPropertyOptional({ description: 'Data de término (YYYY-MM-DD)', example: '2025-11-25' })
    @IsOptional() 
    @IsString() 
    endDate?: string;

    @ApiPropertyOptional({ description: 'Hora de início (HH:MM)', example: '09:00' })
    @IsOptional() 
    @IsString() 
    startHour?: string;

    @ApiPropertyOptional({ description: 'Hora de término (HH:MM)', example: '10:00' })
    @IsOptional() 
    @IsString() 
    endHour?: string;

    @ApiPropertyOptional({ description: 'Padrão de repetição do agendamento', example: 'weekly' })
    @IsOptional() 
    @IsString() 
    repeatScheduling?: string;

    @ApiPropertyOptional({ description: 'Orçamento do serviço', example: 150.00 })
    @IsOptional() 
    @IsNumber() 
    budget?: number;

    @ApiPropertyOptional({ description: 'Status do agendamento', enum: SchedulingCompanyStatus })
    @IsOptional() 
    @IsEnum(SchedulingCompanyStatus) 
    status?: SchedulingCompanyStatus;

    @ApiPropertyOptional({ description: 'Notificação foi enviada', example: true })
    @IsOptional() 
    @IsBoolean() 
    notificationSent?: boolean;

    @ApiPropertyOptional({ description: 'Data da última extensão', example: '2025-11-26T10:00:00Z' })
    @IsOptional() 
    @IsDateString() 
    lastExtension?: Date;
}