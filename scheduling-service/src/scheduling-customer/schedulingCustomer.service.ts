import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SchedulingCustomer } from './schedulingCustomer.model';
import { CreateSchedulingCustomerDto } from './dto/create-scheduling-customer.dto';
import { UpdateSchedulingCustomerDto } from './dto/update-scheduling-customer.dto';
import { SchedulingCustomerStatus } from './schedulingCustomer.model';
import { HttpService } from 'src/http/http.service';
import { SchedulingCompany } from 'src/scheduling-company/schedulingCompany.model';
import { SchedulingCompanyStatus } from 'src/scheduling-company/schedulingCompany.model';
import { RedisService } from 'src/redis/redis.service';

export interface CustomerResponse {
    idCustomer: number;
    name: string;
}

export interface CompanyResponse {
    idCompany: number;
    name: string;
    profession: string;
    street: string;
    number: string;
    phone: string;
}

export interface SchedulingCompanyResponse {
    idSchedulingCompany: number;
    title: string;
    startDate: string;
    endDate: string;
    startHour: string;
    endHour: string;
    status: SchedulingCompanyStatus;
}

@Injectable()
export class SchedulingCustomerService {
    constructor(
        @InjectModel(SchedulingCustomer) private schedulingCustomerModel: typeof SchedulingCustomer,
        @InjectModel(SchedulingCompany) private schedulingCompanyModel: typeof SchedulingCompany,
        private http: HttpService,
        private redis: RedisService
    ) {}

    async create(createSchedulingCustomerDto: CreateSchedulingCustomerDto, token: string) {
        const requiredFields = ['companyId', 'customerId', 'title', 'startDate', 'endDate', 'startHour', 'endHour'];
        for (const field of requiredFields) {
            if (!createSchedulingCustomerDto[field]) {
                throw new BadRequestException('Todos os campos são obrigatórios!');
            }
        }

        let customer;
        try {
            const response = await this.http.users.get(`customer/${createSchedulingCustomerDto.customerId}`, {
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
            const response = await this.http.users.get(`company/${createSchedulingCustomerDto.companyId}`, {
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

        if (createSchedulingCustomerDto.schedulingCompanyId) {
            const schedulingCompany = await this.schedulingCompanyModel.findByPk(
                createSchedulingCustomerDto.schedulingCompanyId
            );
            
            if(!schedulingCompany) {
                throw new NotFoundException('Agendamento da empresa não encontrado!');
            }
        }

        try {
            const SchedulingCustomerData = {
                companyId: createSchedulingCustomerDto.companyId,
                customerId: createSchedulingCustomerDto.customerId,
                schedulingCompanyId: createSchedulingCustomerDto.schedulingCompanyId,
                title: createSchedulingCustomerDto.title,
                startDate: createSchedulingCustomerDto.startDate,
                endDate: createSchedulingCustomerDto.endDate,
                startHour: createSchedulingCustomerDto.startHour,
                endHour: createSchedulingCustomerDto.endHour,
                status: SchedulingCustomerStatus.CONFIRMED
            };

            return await this.schedulingCustomerModel.create(SchedulingCustomerData);
        } catch(error) {
            console.log("teste", error)
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

    async findByCustomerId(customerId: number, token: string) {
        if (!customerId) {
            throw new BadRequestException("O ID do cliente é obrigatório!");
        }

        const cacheKey = `customer:${customerId}`;

        try {
            const cache = await this.redis.getClient();

            const pong = await cache.ping();
            console.log("Redis ping response:", pong);

            const cachedData = await cache.get(cacheKey);
            if (cachedData) {
                console.log(`♻️ Retornando agendamentos do cliente do cache (${cacheKey})`);
                return JSON.parse(cachedData);
            }
        } catch (error) {
            console.log("❌ Erro ao acessar o cache:", error);
        }
        
        let customer: CustomerResponse;
        try {
            const response = await this.http.users.get<CustomerResponse>(`customer/${customerId}`, {
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
                    const res = await this.http.users.get<CompanyResponse>(`company/${id}`, {
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

        const validSchedulingCompanyIds: number[] = [...new Set(
            schedulings.map(s => s.schedulingCompanyId)
        )].filter((id): id is number => id !== null && id !== undefined);
        
        let schedulingCompanies: SchedulingCompanyResponse[] = [];
        
        if (validSchedulingCompanyIds.length > 0) {
            try {
                schedulingCompanies = await this.schedulingCompanyModel.findAll({
                    where: { idSchedulingCompany: validSchedulingCompanyIds } 
                });
            } catch (error) {
                throw new BadRequestException(error.response?.data?.message || 'Erro ao validar agendamentos das empresas');
            }
        }

        const schedulingCompanyMap = new Map<number, SchedulingCompanyResponse>();
        schedulingCompanies.forEach(sc => schedulingCompanyMap.set(sc.idSchedulingCompany, sc));

        const result = schedulings.map(scheduling => {
            const company = companyMap.get(scheduling.companyId);

            let schedulingCompany: SchedulingCompanyResponse | undefined;
            if (scheduling.schedulingCompanyId !== null && scheduling.schedulingCompanyId !== undefined) {
                schedulingCompany = schedulingCompanyMap.get(scheduling.schedulingCompanyId as number);
            }
            
            const schedulingCompanyResponse: SchedulingCompanyResponse | null = schedulingCompany 
                ? {
                    idSchedulingCompany: schedulingCompany.idSchedulingCompany,
                    title: schedulingCompany.title,
                    startDate: schedulingCompany.startDate,
                    endDate: schedulingCompany.endDate,
                    startHour: schedulingCompany.startHour,
                    endHour: schedulingCompany.endHour,
                    status: schedulingCompany.status as SchedulingCompanyStatus,
                } 
                : null;

            return {
                idScheduling: scheduling.idSchedulingCustomer,
                title: scheduling.title,
                startDate: scheduling.startDate,
                endDate: scheduling.endDate,
                startHour: scheduling.startHour,
                endHour: scheduling.endHour,
                status: scheduling.status,

                schedulingCompany: schedulingCompanyResponse,

                customer: {
                    idCustomer: customer.idCustomer,
                    name: customer.name
                },

                company: company ? {
                    idCompany: company.idCompany,
                    name: company.name,
                    profession: company.profession,
                    street: company.street,
                    number: company.number,
                    phone: company.phone
                } : null
            };
        });

        try {
            await this.redis.getClient().set(cacheKey, JSON.stringify(result), 'EX', 300);
            console.log(`💾 Dados dos agendamentos do cliente salvos no cache (${cacheKey}) com TTL de 300s`);
        } catch(error) {
            console.log("❌ Erro ao salvar no cache:", error);
        }

        return result;
    }

    async invalidateSchedulingCustomerCacheById(customerId: number) {
        const pattern = `customer:${customerId}*`;
        const keys = await this.redis.getClient().keys(pattern);

        for (const key of keys) {
            await this.redis.getClient().del(key);
            console.log(`🗑️ Cache do cliente invalidado: ${key}`);
        }
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

        if (dto.schedulingCompanyId && dto.schedulingCompanyId !== scheduling.schedulingCompanyId) { 
            throw new BadRequestException('Agendamento da empresa não pode ser alterado!');
        }

        const validStatuses = [
            SchedulingCustomerStatus.CONFIRMED,
            SchedulingCustomerStatus.CANCELLED
        ];
        if (dto.status && !validStatuses.includes(dto.status)) {
            throw new BadRequestException('Status deve ser CONFIRMED ou CANCELLED');
        }

        const allowedFields = ['startDate', 'endDate', 'startHour', 'endHour', 'status'];
        for (const key of allowedFields) {
            if (dto[key] !== undefined) {
                scheduling[key] = dto[key];
            }
        }

        await scheduling.save();

        if (dto.status) {
            await SchedulingCompany.update(
                { status: SchedulingCompanyStatus[dto.status] },
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