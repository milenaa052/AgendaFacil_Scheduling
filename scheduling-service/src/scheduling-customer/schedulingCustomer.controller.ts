import { Body, Controller, Get, Param, Post, Put, UseGuards, ParseIntPipe } from '@nestjs/common';
import { SchedulingCustomerService } from './schedulingCustomer.service';
import { CreateSchedulingCustomerDto } from './dto/create-scheduling-customer.dto';
import { UpdateSchedulingCustomerDto } from './dto/update-scheduling-customer.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('scheduling-customer')
export class SchedulingCustomerController {
    constructor( private readonly schedulingCustomerService: SchedulingCustomerService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async create(@Body() createSchedulingCustomerDto: CreateSchedulingCustomerDto) {
        return this.schedulingCustomerService.create(createSchedulingCustomerDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async findAll() {
        return this.schedulingCustomerService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.schedulingCustomerService.findById(id);
    }

    /*@Get('scheduling-customer/:customerId')
    @UseGuards(AuthGuard('jwt'))
    async findByCustomerId(@Param('customerId', ParseIntPipe) customerId: number) {
        return this.schedulingCustomerService.findByCustomerId(customerId);
    }*/

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRSchedulingCustomerDto: UpdateSchedulingCustomerDto
    ) {
        return await this.schedulingCustomerService.update(id, updateRSchedulingCustomerDto);
    }
}