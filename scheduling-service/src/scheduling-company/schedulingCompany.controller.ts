import { Body, Controller, Get, Param, Post, Req, Put, UseGuards, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { SchedulingCompanyService } from './schedulingCompany.service';
import { CreateSchedulingCompanyDto } from './dto/create-scheduling-company.dto';
import { UpdateSchedulingCompanyDto } from './dto/update-scheduling-company.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Agendamento de Empresas')
@ApiBearerAuth('JWT-auth')
@Controller('scheduling-company')
export class SchedulingCompanyController {
    constructor( private readonly schedulingCompanyService: SchedulingCompanyService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ 
        summary: 'Criar agendamento da empresa',
        description: 'Cria um novo agendamento pela perspectiva da empresa'
    })
    @ApiBody({ type: CreateSchedulingCompanyDto })
    @ApiResponse({ 
        status: HttpStatus.CREATED, 
        description: 'Agendamento da empresa criado com sucesso'
    })
    @ApiResponse({ 
        status: HttpStatus.UNAUTHORIZED, 
        description: 'Token inválido ou ausente'
    })
    async create(@Body() dto: CreateSchedulingCompanyDto, @Req() req) {
        const token = req.headers.authorization;
        return this.schedulingCompanyService.create(dto, token);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ 
        summary: 'Listar agendamentos das empresas',
        description: 'Retorna todos os agendamentos na perspectiva da empresa'
    })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Lista de agendamentos retornada'
    })
    async findAll() {
        return this.schedulingCompanyService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ 
        summary: 'Buscar agendamento da empresa por ID',
        description: 'Retorna um agendamento específico da empresa'
    })
    @ApiParam({ name: 'id', type: Number, description: 'ID do agendamento' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Agendamento encontrado'
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Agendamento não encontrado'
    })
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.schedulingCompanyService.findById(id);
    }

    @Get('/company/:companyId')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ 
        summary: 'Buscar agendamentos por ID da empresa',
        description: 'Retorna todos os agendamentos de uma empresa específica'
    })
    @ApiParam({ name: 'companyId', type: Number, description: 'ID da empresa' })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Agendamentos da empresa retornados'
    })
    async findByCompanyId(@Param('companyId', ParseIntPipe) companyId: number, @Req() req) {
        const token = req.headers.authorization;
        return this.schedulingCompanyService.findByCompanyId(companyId, token);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ 
        summary: 'Atualizar agendamento da empresa',
        description: 'Atualiza os dados de um agendamento da empresa'
    })
    @ApiParam({ name: 'id', type: Number, description: 'ID do agendamento' })
    @ApiBody({ type: UpdateSchedulingCompanyDto })
    @ApiResponse({ 
        status: HttpStatus.OK, 
        description: 'Agendamento atualizado'
    })
    @ApiResponse({ 
        status: HttpStatus.NOT_FOUND, 
        description: 'Agendamento não encontrado'
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRSchedulingCompanyDto: UpdateSchedulingCompanyDto
    ) {
        return await this.schedulingCompanyService.update(id, updateRSchedulingCompanyDto);
    }
}