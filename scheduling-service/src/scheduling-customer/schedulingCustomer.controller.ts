import { Body, Controller, Get, Param, Post, Req, Put, UseGuards, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { SchedulingCustomerService } from './schedulingCustomer.service';
import { CreateSchedulingCustomerDto } from './dto/create-scheduling-customer.dto';
import { UpdateSchedulingCustomerDto } from './dto/update-scheduling-customer.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Agendamento de Clientes')
@ApiBearerAuth('JWT-auth')
@Controller('scheduling-customer')
export class SchedulingCustomerController {
    constructor( private readonly schedulingCustomerService: SchedulingCustomerService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ 
        summary: 'Criar novo agendamento',
        description: 'Endpoint principal para criação de um novo agendamento de cliente. Requer autenticação JWT.'
    })
    @ApiBody({ 
        type: CreateSchedulingCustomerDto,
        description: 'Dados do agendamento a ser criado'
    })
    @ApiResponse({ 
        status: HttpStatus.CREATED, 
        description: 'Agendamento criado com sucesso',
        schema: {
            example: {
                idSchedulingCustomer: 1,
                companyId: 1,
                customerId: 10,
                schedulingCompanyId: 5,
                title: 'Consulta Médica',
                startDate: '2025-11-25',
                endDate: '2025-11-25',
                startHour: '09:00',
                endHour: '10:00',
                status: 'CONFIRMED'
            }
        }
    })
    @ApiResponse({ 
        status: HttpStatus.BAD_REQUEST, 
        description: 'Dados inválidos ou conflito de horário'
    })
    @ApiResponse({ 
        status: HttpStatus.UNAUTHORIZED, 
        description: 'Token de autenticação inválido ou ausente'
    })
    async create(@Body() createSchedulingCustomerDto: CreateSchedulingCustomerDto, @Req() req) {
        const token = req.headers.authorization;
        return this.schedulingCustomerService.create(createSchedulingCustomerDto, token);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ 
        summary: 'Listar todos os agendamentos',
        description: 'Retorna a lista completa de agendamentos de clientes'
    })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Lista de agendamentos retornada com sucesso',
        schema: {
            example: [
                {
                    idSchedulingCustomer: 1,
                    companyId: 1,
                    customerId: 10,
                    schedulingCompanyId: 5,
                    title: 'Consulta Médica',
                    startDate: '2025-11-25',
                    endDate: '2025-11-25',
                    startHour: '09:00',
                    endHour: '10:00',
                    status: 'CONFIRMED'
                }
            ]
        }
    })
    @ApiResponse({ 
        status: HttpStatus.UNAUTHORIZED, 
        description: 'Token de autenticação inválido ou ausente'
    })
    async findAll() {
        return this.schedulingCustomerService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ 
        summary: 'Buscar agendamento por ID',
        description: 'Retorna os detalhes de um agendamento específico pelo seu ID'
    })
    @ApiParam({ 
        name: 'id', 
        type: Number, 
        description: 'ID do agendamento',
        example: 1
    })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Agendamento encontrado',
        schema: {
            example: {
                idSchedulingCustomer: 1,
                companyId: 1,
                customerId: 10,
                schedulingCompanyId: 5,
                title: 'Consulta Médica',
                startDate: '2025-11-25',
                endDate: '2025-11-25',
                startHour: '09:00',
                endHour: '10:00',
                status: 'CONFIRMED'
            }
        }
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Agendamento não encontrado'
    })
    @ApiResponse({ 
        status: HttpStatus.UNAUTHORIZED, 
        description: 'Token de autenticação inválido ou ausente'
    })
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.schedulingCustomerService.findById(id);
    }

    @Get('/customer/:customerId')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ 
        summary: 'Buscar agendamentos por ID do cliente',
        description: 'Retorna todos os agendamentos de um cliente específico'
    })
    @ApiParam({ 
        name: 'customerId', 
        type: Number, 
        description: 'ID do cliente',
        example: 10
    })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Agendamentos do cliente retornados com sucesso',
        schema: {
            example: [
                {
                    idSchedulingCustomer: 1,
                    companyId: 1,
                    customerId: 10,
                    schedulingCompanyId: 5,
                    title: 'Consulta Médica',
                    startDate: '2025-11-25',
                    endDate: '2025-11-25',
                    startHour: '09:00',
                    endHour: '10:00',
                    status: 'CONFIRMED'
                }
            ]
        }
    })
    @ApiResponse({ 
        status: HttpStatus.UNAUTHORIZED, 
        description: 'Token de autenticação inválido ou ausente'
    })
    async findByCustomerId(@Param('customerId', ParseIntPipe) customerId: number, @Req() req) {
        const token = req.headers.authorization;
        return this.schedulingCustomerService.findByCustomerId(customerId, token);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ 
        summary: 'Atualizar agendamento',
        description: 'Atualiza os dados de um agendamento existente. Todos os campos são opcionais.'
    })
    @ApiParam({ 
        name: 'id', 
        type: Number, 
        description: 'ID do agendamento a ser atualizado',
        example: 1
    })
    @ApiBody({ 
        type: UpdateSchedulingCustomerDto,
        description: 'Dados a serem atualizados no agendamento'
    })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Agendamento atualizado com sucesso',
        schema: {
            example: {
                idSchedulingCustomer: 1,
                companyId: 1,
                customerId: 10,
                schedulingCompanyId: 5,
                title: 'Consulta Médica - Retorno',
                startDate: '2025-11-26',
                endDate: '2025-11-26',
                startHour: '10:00',
                endHour: '11:00',
                status: 'CONFIRMED'
            }
        }
    })
    @ApiResponse({ 
        status: HttpStatus.BAD_REQUEST, 
        description: 'Dados inválidos'
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Agendamento não encontrado'
    })
    @ApiResponse({ 
        status: HttpStatus.UNAUTHORIZED, 
        description: 'Token de autenticação inválido ou ausente'
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRSchedulingCustomerDto: UpdateSchedulingCustomerDto
    ) {
        return await this.schedulingCustomerService.update(id, updateRSchedulingCustomerDto);
    }
}