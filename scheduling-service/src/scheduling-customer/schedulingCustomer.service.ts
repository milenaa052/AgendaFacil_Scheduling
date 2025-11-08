import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SchedulingCustomer } from './schedulingCustomer.model';
import { CreateSchedulingCustomerDto } from './dto/create-scheduling-customer.dto';
import { UpdateSchedulingCustomerDto } from './dto/update-scheduling-customer.dto';
import { SchedulingCustomerStatus } from './schedulingCustomer.model';

@Injectable()
export class SchedulingCustomerService {
    constructor(
        @InjectModel(SchedulingCustomer) private schedulingCustomerModel: typeof SchedulingCustomer,
    ) {}

    async create(createSchedulingCustomerDto: CreateSchedulingCustomerDto): Promise<SchedulingCustomer> {
        const requiredFields = ['companyId', 'customerId', 'title', 'startDate', 'endDate', 'startHour', 'endHour'];
        for (const field of requiredFields) {
            if (!createSchedulingCustomerDto[field]) {
                throw new BadRequestException('Todos os campos são obrigatórios!');
            }
        }

        /*const customer = await this.customerModel.findByPk(createSchedulingCustomerDto.customerId);
        if(!customer) {
            throw new NotFoundException('Cliente não encontrado!');
        }

        const company = await this.companyModel.findByPk(createSchedulingCustomerDto.companyId);
        if(!company) {
            throw new NotFoundException('Empresa não encontrada!');
        }*/

        try {
            const SchedulingCustomerData = {
                companyId: createSchedulingCustomerDto.companyId,
                customerId: createSchedulingCustomerDto.customerId,
                title: createSchedulingCustomerDto.title,
                startDate: new Date(createSchedulingCustomerDto.startDate),
                endDate: new Date(createSchedulingCustomerDto.endDate),
                startHour: createSchedulingCustomerDto.startHour,
                endHour: createSchedulingCustomerDto.endHour,
                status: SchedulingCustomerStatus.PENDING
            };

            return await this.schedulingCustomerModel.create(SchedulingCustomerData);
        } catch (error) {
            throw new BadRequestException('Erro ao criar o agendamento!');
        }
    }

    async findAll() {
        return await this.schedulingCustomerModel.findAll();
    }

    async findById(id: number) {
        const schedulingCustomer = await this.schedulingCustomerModel.findByPk(id);
        
        if (!schedulingCustomer) throw new NotFoundException('Agendamento não encontrado!');
        return schedulingCustomer;
    }

    /*async findByCustomerId(customerId: number) {
        const customer = await this.customerModel.findByPk(customerId);
        if(!customer) {
            throw new NotFoundException('Cliente não encontrado!');
        }

        const scheduling = await this.schedulingCustomerModel.findAll({
            where: { customerId },
            include: [
                {
                    model: Customer,
                    attributes: ['idCustomer', 'name']
                },
                {
                    model: Company,
                    attributes: ['idCompany', 'name']
                }
            ],
            order: [['date', 'DESC']]
        });
        return scheduling;
    }*/

    async update(id: number, dto: UpdateSchedulingCustomerDto) {
        const scheduling = await this.schedulingCustomerModel.findByPk(id);
        if (!scheduling) {
            throw new NotFoundException('Avaliação não encontrada!');
        }

        /*if (dto.customerId) {
            const customer = await this.customerModel.findByPk(dto.customerId);
            if (!customer) {
                throw new NotFoundException('Cliente não encontrado"!');
            }
        }

        if (dto.companyId) {
            const company = await this.companyModel.findByPk(dto.companyId);
            if (!company) {
                throw new NotFoundException('Empresa não encontrada!');
            }
        }

        if (dto.customerId && dto.customerId !== customer.idCustomer) { 
            throw new BadRequestException('Cliente não pode ser alterado!');
        }

        if (dto.companyId && dto.companyId !== company.idCompany) { 
            throw new BadRequestException('Empresa não pode ser alterado!');
        }*/

        if (dto.status && dto.status !== SchedulingCustomerStatus.PENDING || SchedulingCustomerStatus.CONFIRMED || SchedulingCustomerStatus.CANCELLED) {
            throw new BadRequestException('Status deve ser PENDING, CONFIRMED ou CANCELLED');
        }

        try {
            Object.assign(scheduling, dto);
            await scheduling.save();
            return scheduling;
        } catch (error) {
            throw new BadRequestException('Erro ao atualizar o agendamento!');
        }
    }
}