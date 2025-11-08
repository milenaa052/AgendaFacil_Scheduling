import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SchedulingCompany } from './schedulingCompany.model';
import { CreateSchedulingCompanyDto } from './dto/create-scheduling-company.dto';
import { UpdateSchedulingCompanyDto } from './dto/update-scheduling-company.dto';
import { SchedulingCompanyStatus } from './schedulingCompany.model';

@Injectable()
export class SchedulingCompanyService {
    constructor(
        @InjectModel(SchedulingCompany) private schedulingCompanyModel: typeof SchedulingCompany,
    ) {}

    async create(createSchedulingCompanyDto: CreateSchedulingCompanyDto): Promise<SchedulingCompany> {
        const requiredFields = ['companyId', 'customerId', 'title', 'startDate', 'endDate', 'startHour', 'endHour'];
        for (const field of requiredFields) {
            if (!createSchedulingCompanyDto[field]) {
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
            const SchedulingCompanyData = {
                companyId: createSchedulingCompanyDto.companyId,
                customerId: createSchedulingCompanyDto.customerId,
                title: createSchedulingCompanyDto.title,
                startDate: new Date(createSchedulingCompanyDto.startDate),
                endDate: new Date(createSchedulingCompanyDto.endDate),
                startHour: createSchedulingCompanyDto.startHour,
                endHour: createSchedulingCompanyDto.endHour,
                status: SchedulingCompanyStatus.PENDING
            };

            return await this.schedulingCompanyModel.create(SchedulingCompanyData);
        } catch (error) {
            throw new BadRequestException('Erro ao criar o agendamento!');
        }
    }

    async findAll() {
        return await this.schedulingCompanyModel.findAll();
    }

    async findById(id: number) {
        const schedulingCompany = await this.schedulingCompanyModel.findByPk(id);
        
        if (!schedulingCompany) throw new NotFoundException('Agendamento não encontrado!');
        return schedulingCompany;
    }

    /*async findByCompanyId(companyId: number) {
        const company = await this.companyModel.findByPk(companyId);
        if(!company) {
            throw new NotFoundException('Cliente não encontrado!');
        }

        const scheduling = await this.schedulingCompanyModel.findAll({
            where: { companyId },
            include: [
                {
                    model: Customer,
                    attributes: ['idCustomer', 'name', 'street', 'number']
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

    async update(id: number, dto: UpdateSchedulingCompanyDto) {
        const scheduling = await this.schedulingCompanyModel.findByPk(id);
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

        if (dto.status && dto.status !== SchedulingCompanyStatus.PENDING || SchedulingCompanyStatus.CONFIRMED || SchedulingCompanyStatus.CANCELLED) {
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