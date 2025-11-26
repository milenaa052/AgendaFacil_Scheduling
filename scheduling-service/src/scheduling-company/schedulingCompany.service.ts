import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SchedulingCompany } from './schedulingCompany.model';
import { CreateSchedulingCompanyDto } from './dto/create-scheduling-company.dto';
import { UpdateSchedulingCompanyDto } from './dto/update-scheduling-company.dto';
import { SchedulingCompanyStatus } from './schedulingCompany.model';
import { HttpService } from 'src/http/http.service';
import { SchedulingCustomer } from 'src/scheduling-customer/schedulingCustomer.model';
import { SchedulingCustomerStatus } from 'src/scheduling-customer/schedulingCustomer.model';
import { RedisService } from 'src/redis/redis.service';

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
        private http: HttpService,
        private redis: RedisService
    ) {}

    async create(createSchedulingCompanyDto: CreateSchedulingCompanyDto, token: string): Promise<SchedulingCompany> {
        const requiredFields = ['companyId', 'title', 'startDate', 'endDate', 'startHour', 'endHour', 'status'];
        for (const field of requiredFields) {
            if (!createSchedulingCompanyDto[field]) {
                throw new BadRequestException('Todos os campos são obrigatórios!');
            }
        }

        if(createSchedulingCompanyDto.customerId) {
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

        if(createSchedulingCompanyDto.schedulingCustomerId) {
            const schedulingCustomer = await this.schedulingCustomerModel.findByPk(createSchedulingCompanyDto.schedulingCustomerId);
            if(!schedulingCustomer) {
                throw new NotFoundException('Agendamento do cliente não encontrado!');
            }
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
            repeatScheduling: createSchedulingCompanyDto.repeatScheduling,
            budget: createSchedulingCompanyDto.budget,
            status: createSchedulingCompanyDto.status,
            notificationSent: false,
            lastExtension: createSchedulingCompanyDto.lastExtension
        };

        const schedulingCompany = await this.schedulingCompanyModel.create(SchedulingCompanyData);

        const cacheKey = `company:${createSchedulingCompanyDto.companyId}`;
        await this.redis.getClient().del(cacheKey);
        console.log(`🗑️ Cache invalidado: ${cacheKey}`);

        return schedulingCompany;
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
        if (!companyId) {
            throw new BadRequestException("O ID da empresa é obrigatório!");
        }

        const cacheKey = `company:${companyId}`;

        try {
            const cache = await this.redis.getClient();

            const pong = await cache.ping();
            console.log("Redis ping response:", pong);

            const cachedData = await cache.get(cacheKey);
            if (cachedData) {
                console.log(`♻️ Retornando agendamentos da empresa do cache (${cacheKey})`);
                return JSON.parse(cachedData);
            }
        } catch (error) {
            console.log("❌ Erro ao acessar o cache:", error);
        }

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

        const validCustomerIds = [...new Set(schedulings
            .map(s => s.customerId)
            .filter(id => id)
        )];

        let customers: CustomerResponse[];
        if (validCustomerIds.length > 0) {
            try {
                customers = await Promise.all(
                    validCustomerIds.map(async (id) => {
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
        } else { 
            customers = [];
        }

        const customerMap = new Map<number, CustomerResponse>();
        customers.forEach(c => customerMap.set(c.idCustomer, c));

        const validSchedulingCustomerIds = [...new Set(schedulings
            .map(s => s.customerId)
            .filter(id => id)
        )];

        let schedulingCustomers: SchedulingCustomerResponse[];
        if(validSchedulingCustomerIds.length > 0) {
            try {
                schedulingCustomers = await this.schedulingCustomerModel.findAll({
                    where: { idSchedulingCustomer: validSchedulingCustomerIds } 
                });
            } catch (error) {
                if (error.response?.status === 404) {
                    throw new NotFoundException('Algum agendamento do cliente vinculado ao agendamento não foi encontrado!');
                }

                throw new BadRequestException(error.response?.data?.message || 'Erro ao validar agendamentos dos clientes');
            }
        } else {
            schedulingCustomers = [];
        }
        
        const schedulingCustomerMap = new Map<number, SchedulingCustomerResponse>();
        schedulingCustomers.forEach(sc => schedulingCustomerMap.set(sc.idSchedulingCustomer, sc));

        const result = schedulings.map(scheduling => {
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
                budget: scheduling.budget,
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

        try {
            await this.redis.getClient().set(cacheKey, JSON.stringify(result), 'EX', 300);
            console.log(`💾 Dados dos agendamentos da empresa salvos no cache (${cacheKey}) com TTL de 300s`);
        } catch(error) {
            console.log("❌ Erro ao salvar no cache:", error);
        }

        return result;
    }

    async invalidateSchedulingCompanyCacheById(companyId: number) {
        const pattern = `company:${companyId}*`;
        const keys = await this.redis.getClient().keys(pattern);

        for (const key of keys) {
            await this.redis.getClient().del(key);
            console.log(`🗑️ Cache da empresa invalidado: ${key}`);
        }
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
            SchedulingCompanyStatus.CANCELLED,
            SchedulingCompanyStatus.COMPLETED,
            SchedulingCompanyStatus.BLOCKED
        ];
        if (dto.status && !validStatuses.includes(dto.status)) {
            throw new BadRequestException('Status deve ser CONFIRMED, CANCELLED, COMPLETED ou BLOCKED');
        }

        let shouldUpdateLastExtension = false;
        if (dto.endHour !== undefined || dto.endDate !== undefined) {
            shouldUpdateLastExtension = true;
        }

        const allowedFields = ['startDate', 'endDate', 'startHour', 'endHour', 'repeateScheduling', 'budget', 'status', 'notificationSent', 'lastExtension'];
        for (const key of allowedFields) {
            if (dto[key] !== undefined) {
                scheduling[key] = dto[key];
            }
        }

        if (shouldUpdateLastExtension) {
            scheduling.lastExtension = new Date();
        }

        await scheduling.save();

        const cacheKey = `company:${scheduling.companyId}`;
        await this.redis.getClient().del(cacheKey);
        console.log(`🗑️ Cache invalidado: ${cacheKey}`);

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

            const cacheKeyCustomer = `customer:${scheduling.customerId}`;
            await this.redis.getClient().del(cacheKeyCustomer);
            console.log(`🗑️ Cache do cliente invalidado após cross-update: ${cacheKeyCustomer}`);
        }

        return scheduling;
    }

    async deleteById(id: number): Promise<{ message: string }> {
        const schedulingCompany = await this.schedulingCompanyModel.findByPk(id);
        
        if (!schedulingCompany) {
            throw new NotFoundException('Agendamento bloqueado não encontrado!');
        }

        if(schedulingCompany.status != "BLOCKED") {
            throw new BadRequestException('Não é permitido excluir agendamentos que não tenha o status igual a BLOCKED!');
        }

        return { message: 'Agendamento deletado com sucesso!' };
    }
}