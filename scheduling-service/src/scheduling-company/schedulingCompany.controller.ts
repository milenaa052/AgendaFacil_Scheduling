import { Body, Controller, Get, Param, Post, Req, Put, UseGuards, ParseIntPipe, Delete, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { SchedulingCompanyService } from './schedulingCompany.service';
import { CreateSchedulingCompanyDto } from './dto/create-scheduling-company.dto';
import { UpdateSchedulingCompanyDto } from './dto/update-scheduling-company.dto';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './schedulingReports.service';

@ApiTags('Agendamento de Empresas')
@ApiBearerAuth('JWT-auth')
@Controller('scheduling-company')
export class SchedulingCompanyController {
    constructor( 
        private readonly schedulingCompanyService: SchedulingCompanyService,
        private readonly reportsCompany: ReportsService
    ) {}

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

    @Get('reports/completed/:companyId/:month/:year')
    @UseGuards(AuthGuard('jwt'))
    async findByServiceCompleted(
        @Param('companyId', ParseIntPipe) companyId: number,
        @Param('month') month: string,
        @Param('year', ParseIntPipe) year: number,
        @Req() req
    ) {
        const token = req.headers.authorization;
        return this.reportsCompany.findByServiceCompleted(
            companyId,
            month,
            year,
            token
        );
    }

    @Get('reports/budget/:companyId/:month/:year')
    @UseGuards(AuthGuard('jwt'))
    async findByTotalBudget(
        @Param('companyId', ParseIntPipe) companyId: number,
        @Param('month') month: string,
        @Param('year', ParseIntPipe) year: number,
        @Req() req
    ) {
        const token = req.headers.authorization;
        return this.reportsCompany.findByTotalBudget(
            companyId,
            month,
            year,
            token
        );
    }

    @Get('reports/cancelled/:companyId/:month/:year')
    @UseGuards(AuthGuard('jwt'))
    async findByCancelled(
        @Param('companyId', ParseIntPipe) companyId: number,
        @Param('month') month: string,
        @Param('year', ParseIntPipe) year: number,
        @Req() req
    ) {
        const token = req.headers.authorization;
        return this.reportsCompany.findByServiceCancelled(
            companyId,
            month,
            year,
            token
        );
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

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    async deleteById(@Param('id', ParseIntPipe) id: number) {
        return this.schedulingCompanyService.deleteById(id);
    }
}