import { Body, Controller, Get, Param, Post, Put, UseGuards, ParseIntPipe } from '@nestjs/common';
import { SchedulingCompanyService } from './schedulingCompany.service';
import { CreateSchedulingCompanyDto } from './dto/create-scheduling-company.dto';
import { UpdateSchedulingCompanyDto } from './dto/update-scheduling-company.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('scheduling-company')
export class SchedulingCompanyController {
    constructor( private readonly schedulingCompanyService: SchedulingCompanyService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async create(@Body() createSchedulingCompanyDto: CreateSchedulingCompanyDto) {
        return this.schedulingCompanyService.create(createSchedulingCompanyDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async findAll() {
        return this.schedulingCompanyService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.schedulingCompanyService.findById(id);
    }

    /*@Get('scheduling-company/:companyId')
    @UseGuards(AuthGuard('jwt'))
    async findByCompanyId(@Param('companyId', ParseIntPipe) companyId: number) {
        return this.schedulingCompanyService.findByCompanyId(companyId);
    }*/

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRSchedulingCompanyDto: UpdateSchedulingCompanyDto
    ) {
        return await this.schedulingCompanyService.update(id, updateRSchedulingCompanyDto);
    }
}