import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SchedulingCustomer } from './schedulingCustomer.model';
import { CreateSchedulingCustomerDto } from './dto/create-scheduling-customer.dto';
import { UpdateSchedulingCustomerDto } from './dto/update-scheduling-customer.dto';
import { SchedulingCustomerStatus } from './schedulingCustomer.model';
import { HttpService } from 'src/http/http.service';

@Injectable()
export class SchedulingCustomerService {
    constructor(
        @InjectModel(SchedulingCustomer) private schedulingCustomerModel: typeof SchedulingCustomer,
        private http: HttpService
    ) {}

    async create(createSchedulingCustomerDto: CreateSchedulingCustomerDto): Promise<SchedulingCustomer> {
        const requiredFields = ['companyId', 'customerId', 'title', 'startDate', 'endDate', 'startHour', 'endHour'];
        for (const field of requiredFields) {
            if (!createSchedulingCustomerDto[field]) {
                throw new BadRequestException('Todos os campos são obrigatórios!');
            }
        }

        const customer = await this.http.instance.get(`customer/${createSchedulingCustomerDto.customerId}`);
        if(!customer) {
            throw new NotFoundException('Cliente não encontrado!');
        }

        const company = await this.http.instance.get(`company/${createSchedulingCustomerDto.companyId}`);
        if(!company) {
            throw new NotFoundException('Empresa não encontrada!');
        }

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

    async findByCustomerId(customerId: number) {
        const { data: customer } = await this.http.instance.get(`/customer/${customerId}`);
        if (!customer) {
            throw new NotFoundException('Cliente não encontrado!');
        }

        const schedulings = await this.schedulingCustomerModel.findAll({
            where: { customerId },
            order: [['startDate', 'DESC']],
        });

        if (schedulings.length === 0) {
            return [];
        }

        const companyIds = [...new Set(schedulings.map(scheduling => scheduling.companyId))];
        const companies = await Promise.all(
            companyIds.map(id => this.http.instance.get(`/company/${id}`).then(res => res.data))
        );

        const companyMap = new Map();
        companies.forEach(c => {
            companyMap.set(c.idCompany, c);
        });

        const result = schedulings.map(scheduling => {
            const company = companyMap.get(scheduling.customerId);
            return {
                idScheduling: scheduling.idSchedulingCustomer,
                startDate: scheduling.startDate,
                endDate: scheduling.endDate,
                startHour: scheduling.startHour,
                endHour: scheduling.endHour,
                status: scheduling.status,
            customer: {
                idCustomer: customer.idCustomer,
                name: customer.name,
            },
            company: company
                ? {
                    idCompany: company.idCompany,
                    name: company.name,
                    street: company.street,
                    number: company.number,
                    phone: company.phone
                }
                : null,
            };
        });

        return result;
    }

    async update(id: number, dto: UpdateSchedulingCustomerDto) {
        const scheduling = await this.schedulingCustomerModel.findByPk(id);
        if (!scheduling) {
            throw new NotFoundException('Avaliação não encontrada!');
        }

        if (dto.customerId && dto.customerId !== scheduling.customerId) { 
            throw new BadRequestException('Cliente não pode ser alterado!');
        }

        if (dto.companyId && dto.companyId !== scheduling.companyId) { 
            throw new BadRequestException('Empresa não pode ser alterado!');
        }

        const validStatuses = [
            SchedulingCustomerStatus.PENDING,
            SchedulingCustomerStatus.CONFIRMED,
            SchedulingCustomerStatus.CANCELLED
        ];
        if (dto.status && !validStatuses.includes(dto.status)) {
            throw new BadRequestException('Status deve ser PENDING, CONFIRMED ou CANCELLED');
        }

        if (scheduling.customerId) {
            const { data: customer } = await this.http.instance.get(`/customer/${scheduling.customerId}`);
            if (!customer) {
                throw new NotFoundException('Cliente não encontrado!');
            }
        }

        if (scheduling.companyId) {
            const { data: company } = await this.http.instance.get(`/company/${scheduling.companyId}`);
            if (!company) {
                throw new NotFoundException('Empresa não encontrada!');
            }
        }

        const allowedFields = ['startDate', 'endDate', 'startHour', 'endHour', 'status'];
        for (const key of allowedFields) {
            if (dto[key] !== undefined) {
                scheduling[key] = dto[key];
            }
        }

        await scheduling.save();
        return scheduling;
    }
}