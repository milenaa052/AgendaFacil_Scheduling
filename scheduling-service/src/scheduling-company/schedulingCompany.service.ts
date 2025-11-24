import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SchedulingCompany } from './schedulingCompany.model';
import { CreateSchedulingCompanyDto } from './dto/create-scheduling-company.dto';
import { UpdateSchedulingCompanyDto } from './dto/update-scheduling-company.dto';
import { SchedulingCompanyStatus } from './schedulingCompany.model';
import { HttpService } from 'src/http/http.service';
import { SchedulingCustomer } from 'src/scheduling-customer/schedulingCustomer.model';
import { SchedulingCustomerStatus } from 'src/scheduling-customer/schedulingCustomer.model';

export interface CompanyResponse {
    idCompany: number;
    name: string;
}

export interface CustomerResponse {
    idCustomer: number;
    name: string;
    street: string;
    number: string;
    phone: string;
}

export interface SchedulingCustomerResponse {
    idSchedulingCustomer: number;
    title: string;
    startDate: string;
    endDate: string;
    startHour: string;
    endHour: string;
    status: SchedulingCustomerStatus;
}

@Injectable()
export class SchedulingCompanyService {
    constructor(
        @InjectModel(SchedulingCompany) private schedulingCompanyModel: typeof SchedulingCompany,
        @InjectModel(SchedulingCustomer) private schedulingCustomerModel: typeof SchedulingCustomer,
        private http: HttpService
    ) {}

    async create(createSchedulingCompanyDto: CreateSchedulingCompanyDto, token: string): Promise<SchedulingCompany> {
        const requiredFields = ['companyId', 'customerId', 'schedulingCustomerId', 'title', 'startDate', 'endDate', 'startHour', 'endHour'];
        for (const field of requiredFields) {
            if (!createSchedulingCompanyDto[field]) {
                throw new BadRequestException('Todos os campos são obrigatórios!');
            }
        }

        let customer;
        try {
            const response = await this.http.users.get(`customer/${createSchedulingCompanyDto.customerId}`, {
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
            const response = await this.http.users.get(`company/${createSchedulingCompanyDto.companyId}`, {
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

        const schedulingCustomer = await this.schedulingCustomerModel.findByPk(createSchedulingCompanyDto.schedulingCustomerId);
        if(!schedulingCustomer) {
            throw new NotFoundException('Agendamento do cliente não encontrado!');
        }

        const SchedulingCompanyData = {
            companyId: createSchedulingCompanyDto.companyId,
            customerId: createSchedulingCompanyDto.customerId,
            schedulingCustomerId: createSchedulingCompanyDto.schedulingCustomerId,
            title: createSchedulingCompanyDto.title,
            startDate: createSchedulingCompanyDto.startDate,
            endDate: createSchedulingCompanyDto.endDate,
            startHour: createSchedulingCompanyDto.startHour,
            endHour: createSchedulingCompanyDto.endHour,
            status: SchedulingCompanyStatus.CONFIRMED,
            notificationSent: false,
            lastExtension: createSchedulingCompanyDto.lastExtension
        };

        return await this.schedulingCompanyModel.create(SchedulingCompanyData);
    }

    async findAll() {
        return await this.schedulingCompanyModel.findAll();
    }

    async findById(id: number) {
        const schedulingCompany = await this.schedulingCompanyModel.findByPk(id);
        
        if (!schedulingCompany) throw new NotFoundException('Agendamento não encontrado!');
        return schedulingCompany;
    }

    async findByCompanyId(companyId: number, token: string) {
        let company: CompanyResponse;
        try {
            const response = await this.http.users.get<CompanyResponse>(`company/${companyId}`, {
                headers: { Authorization: token }
            });

            company = response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new NotFoundException('Empresa não encontrada!');
            }

            throw new BadRequestException(error.response?.data?.message || 'Erro ao validar empresa');
        }

        const schedulings = await this.schedulingCompanyModel.findAll({
            where: { companyId },
            order: [['startDate', 'DESC']]
        });

        if (schedulings.length === 0) {
            return [];
        }

        const customerIds = [...new Set(schedulings.map(s => s.customerId))];

        let customers: CustomerResponse[];
        try {
            customers = await Promise.all(
                customerIds.map(async (id) => {
                    const res = await this.http.users.get<CustomerResponse>(`customer/${id}`, {
                        headers: { Authorization: token }
                    });
                    return res.data;
                })
            );
        } catch (error) {
            if (error.response?.status === 404) {
                throw new NotFoundException('Algum cliente vinculado ao agendamento não foi encontrado!');
            }

            throw new BadRequestException(error.response?.data?.message || 'Erro ao validar cliente(s)');
        }

        const customerMap = new Map<number, CustomerResponse>();
        customers.forEach(c => customerMap.set(c.idCustomer, c));

        const schedulingCustomerIds = [...new Set(schedulings.map(s => s.schedulingCustomerId))];

        let schedulingCustomers: SchedulingCustomerResponse[];
        try {
            schedulingCustomers = await this.schedulingCustomerModel.findAll({
                where: { idSchedulingCustomer: schedulingCustomerIds } 
            });
        } catch (error) {
            if (error.response?.status === 404) {
                throw new NotFoundException('Algum agendamento do cliente vinculado ao agendamento não foi encontrado!');
            }

            throw new BadRequestException(error.response?.data?.message || 'Erro ao validar agendamentos dos clientes');
        }

        const schedulingCustomerMap = new Map<number, SchedulingCustomerResponse>();
        schedulingCustomers.forEach(sc => schedulingCustomerMap.set(sc.idSchedulingCustomer, sc));

        return schedulings.map(scheduling => {
            const customer = customerMap.get(scheduling.customerId);
            const schedulingCustomer = schedulingCustomerMap.get(scheduling.schedulingCustomerId);

            const schedulingCustomerResponse: SchedulingCustomerResponse | null = schedulingCustomer 
                ? {
                    idSchedulingCustomer: schedulingCustomer.idSchedulingCustomer,
                    title: schedulingCustomer.title,
                    startDate: schedulingCustomer.startDate,
                    endDate: schedulingCustomer.endDate,
                    startHour: schedulingCustomer.startHour,
                    endHour: schedulingCustomer.endHour,
                    status: schedulingCustomer.status as SchedulingCustomerStatus,
                } 
                : null;

            return {
                idScheduling: scheduling.idSchedulingCompany,
                title: scheduling.title,
                startDate: scheduling.startDate,
                endDate: scheduling.endDate,
                startHour: scheduling.startHour,
                endHour: scheduling.endHour,
                status: scheduling.status,

                schedulingCustomer: schedulingCustomerResponse,

                company: {
                    idCompany: company.idCompany,
                    name: company.name
                },

                customer: customer
                    ? {
                        idCustomer: customer.idCustomer,
                        name: customer.name,
                        street: customer.street,
                        number: customer.number,
                        phone: customer.phone
                    }
                    : null
            };
        });
    }

    async update(id: number, dto: UpdateSchedulingCompanyDto) {
        const scheduling = await this.schedulingCompanyModel.findByPk(id);
        if (!scheduling) {
            throw new NotFoundException('Avaliação não encontrada!');
        }

        if (dto.customerId && dto.customerId !== scheduling.customerId) { 
            throw new BadRequestException('Cliente não pode ser alterado!');
        }

        if (dto.companyId && dto.companyId !== scheduling.companyId) { 
            throw new BadRequestException('Empresa não pode ser alterado!');
        }

        if (dto.schedulingCustomerId && dto.schedulingCustomerId !== scheduling.schedulingCustomerId) { 
            throw new BadRequestException('Agendamento do cliente não pode ser alterado!');
        }

        const validStatuses = [
            SchedulingCompanyStatus.CONFIRMED,
            SchedulingCompanyStatus.CANCELLED
        ];
        if (dto.status && !validStatuses.includes(dto.status)) {
            throw new BadRequestException('Status deve ser CONFIRMED ou CANCELLED');
        }

        if (dto.endHour !== undefined || dto.notificationSent !== undefined) {
            scheduling.lastExtension = new Date();
        }

        const allowedFields = ['startDate', 'endDate', 'startHour', 'endHour', 'status', 'notificationSent', 'lastExtension'];
        for (const key of allowedFields) {
            if (dto[key] !== undefined) {
                scheduling[key] = dto[key];
            }
        }

        await scheduling.save();

        if (dto.endHour !== undefined) {
            scheduling.lastExtension = new Date();
            scheduling.endHour = dto.endHour;
        }

        if (dto.notificationSent !== undefined) {
            scheduling.notificationSent = dto.notificationSent;
        }

        if (dto.status) {
            await SchedulingCustomer.update(
                { status: SchedulingCustomerStatus[dto.status] },
                {
                    where: {
                        customerId: scheduling.customerId,
                        companyId: scheduling.companyId,
                        startDate: scheduling.startDate,
                        startHour: scheduling.startHour
                    }
                }
            );
        }

        return scheduling;
    }
}