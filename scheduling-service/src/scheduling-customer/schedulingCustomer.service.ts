import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SchedulingCustomer } from './schedulingCustomer.model';
import { CreateSchedulingCustomerDto } from './dto/create-scheduling-customer.dto';
import { UpdateSchedulingCustomerDto } from './dto/update-scheduling-customer.dto';
import { SchedulingCustomerStatus } from './schedulingCustomer.model';
import { HttpService } from 'src/http/http.service';

export interface CustomerResponse {
    idCustomer: number;
    name: string;
}

export interface CompanyResponse {
    idCompany: number;
    name: string;
    street: string;
    number: string;
    phone: string;
}

@Injectable()
export class SchedulingCustomerService {
    constructor(
        @InjectModel(SchedulingCustomer) private schedulingCustomerModel: typeof SchedulingCustomer,
        private http: HttpService
    ) {}

    async create(createSchedulingCustomerDto: CreateSchedulingCustomerDto, token: string): Promise<SchedulingCustomer> {
        const requiredFields = ['companyId', 'customerId', 'title', 'startDate', 'endDate', 'startHour', 'endHour'];
        for (const field of requiredFields) {
            if (!createSchedulingCustomerDto[field]) {
                throw new BadRequestException('Todos os campos são obrigatórios!');
            }
        }

        let customer;
        try {
            const response = await this.http.instance.get(`customer/${createSchedulingCustomerDto.customerId}`, {
                headers: { Authorization: token }
            });
            customer = response.data;
        } catch (error) {

            if (error.response?.status === 404) {
                throw new NotFoundException('Cliente não encontrado!');
            }

            throw new BadRequestException(
                error.response?.data?.message || 'Erro ao validar cliente'
            );
        }

        let company;
        try {
            const response = await this.http.instance.get(`company/${createSchedulingCustomerDto.companyId}`, {
                headers: { Authorization: token }
            });
            company = response.data;
        } catch (error) {

            if (error.response?.status === 404) {
                throw new NotFoundException('Empresa não encontrada!');
            }

            throw new BadRequestException(
                error.response?.data?.message || 'Erro ao validar empresa'
            );
        }

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
    }

    async findAll() {
        return await this.schedulingCustomerModel.findAll();
    }

    async findById(id: number) {
        const schedulingCustomer = await this.schedulingCustomerModel.findByPk(id);
        
        if (!schedulingCustomer) throw new NotFoundException('Agendamento não encontrado!');
        return schedulingCustomer;
    }

    async findByCustomerId(customerId: number, token: string) {
        let customer: CustomerResponse;
        try {
            const response = await this.http.instance.get<CustomerResponse>(`customer/${customerId}`, {
                headers: { Authorization: token }
            });

            customer = response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new NotFoundException('Cliente não encontrado!');
            }

            throw new BadRequestException(error.response?.data?.message || 'Erro ao validar cliente');
        }

        const schedulings = await this.schedulingCustomerModel.findAll({
            where: { customerId },
            order: [['startDate', 'DESC']]
        });

        if (schedulings.length === 0) {
            return [];
        }


        const companyIds = [...new Set(schedulings.map(s => s.companyId))];

        let companies: CompanyResponse[];
        try {
            companies = await Promise.all(
                companyIds.map(async (id) => {
                    const res = await this.http.instance.get<CompanyResponse>(`company/${id}`, {
                        headers: { Authorization: token }
                    });
                    return res.data;
                })
            );
        } catch (error) {
            if (error.response?.status === 404) {
                throw new NotFoundException('Alguma empresa vinculada ao agendamento não foi encontrada!');
            }

            throw new BadRequestException(error.response?.data?.message || 'Erro ao validar empresa(s)');
        }

        const companyMap = new Map<number, CompanyResponse>();
        companies.forEach(c => companyMap.set(c.idCompany, c));

        return schedulings.map(scheduling => {
            const company = companyMap.get(scheduling.companyId);

            return {
                idScheduling: scheduling.idSchedulingCustomer,
                title: scheduling.title,
                startDate: scheduling.startDate,
                endDate: scheduling.endDate,
                startHour: scheduling.startHour,
                endHour: scheduling.endHour,
                status: scheduling.status,

                customer: {
                    idCustomer: customer.idCustomer,
                    name: customer.name
                },

                company: company ? {
                    idCompany: company.idCompany,
                    name: company.name,
                    street: company.street,
                    number: company.number,
                    phone: company.phone
                } : null
            };
        });
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