import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSchedulingCustomerDto {
    @ApiProperty({
        description: 'ID da empresa',
        example: 1,
        type: Number,
    })
    @IsNumber() 
    companyId: number;

    @ApiProperty({
        description: 'ID do cliente',
        example: 10,
        type: Number,
    })
    @IsNumber() 
    customerId: number;

    @ApiPropertyOptional({
        description: 'ID do agendamento da empresa (opcional)',
        example: 5,
        type: Number,
    })
    @IsOptional() 
    @IsNumber() 
    schedulingCompanyId: number;

    @ApiProperty({
        description: 'Título do agendamento',
        example: 'Consulta Médica',
        type: String,
    })
    @IsString() 
    title: string;

    @ApiProperty({
        description: 'Data de início do agendamento (formato: YYYY-MM-DD)',
        example: '2025-11-25',
        type: String,
    })
    @IsString() 
    startDate: string;

    @ApiProperty({
        description: 'Data de término do agendamento (formato: YYYY-MM-DD)',
        example: '2025-11-25',
        type: String,
    })
    @IsString() 
    endDate: string;

    @ApiProperty({
        description: 'Hora de início (formato: HH:MM)',
        example: '09:00',
        type: String,
    })
    @IsString() 
    startHour: string;

    @ApiProperty({
        description: 'Hora de término (formato: HH:MM)',
        example: '10:00',
        type: String,
    })
    @IsString() 
    endHour: string;
}