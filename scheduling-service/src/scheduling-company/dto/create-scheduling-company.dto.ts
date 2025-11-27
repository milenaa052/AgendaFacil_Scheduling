import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSchedulingCompanyDto {
    @ApiProperty({ description: 'ID da empresa', example: 1 })
    @IsNumber() 
    companyId: number;

    @ApiProperty({ description: 'ID do cliente', example: 10 })
    @IsNumber() 
    customerId: number;

    @ApiProperty({ description: 'ID do agendamento do cliente', example: 5 })
    @IsNumber() 
    schedulingCustomerId: number;

    @ApiProperty({ description: 'Título do agendamento', example: 'Reunião com cliente' })
    @IsString() 
    title: string;

    @ApiProperty({ description: 'Data de início (YYYY-MM-DD)', example: '2025-11-25' })
    @IsString() 
    startDate: string;

    @ApiProperty({ description: 'Data de término (YYYY-MM-DD)', example: '2025-11-25' })
    @IsString() 
    endDate: string;

    @ApiProperty({ description: 'Hora de início (HH:MM)', example: '09:00' })
    @IsString() 
    startHour: string;

    @ApiProperty({ description: 'Hora de término (HH:MM)', example: '10:00' })
    @IsString() 
    endHour: string;

    @ApiPropertyOptional({ description: 'Orçamento do serviço', example: 150.00 })
    @IsOptional() 
    @IsNumber() 
    budget: number;

    @ApiPropertyOptional({ description: 'Data da última extensão', example: '2025-11-26T10:00:00Z' })
    @IsOptional() 
    @IsDateString() 
    lastExtension: Date;
}