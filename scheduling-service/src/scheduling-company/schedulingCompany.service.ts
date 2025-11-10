import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SchedulingCompany } from './schedulingCompany.model';
import { CreateSchedulingCompanyDto } from './dto/create-scheduling-company.dto';
import { UpdateSchedulingCompanyDto } from './dto/update-scheduling-company.dto';
import { SchedulingCompanyStatus } from './schedulingCompany.model';
import { HttpService } from 'src/http/http.service';

@Injectable()
export class SchedulingCompanyService {
    constructor(
        @InjectModel(SchedulingCompany) private schedulingCompanyModel: typeof SchedulingCompany,
        private http: HttpService
    ) {}

    async create(createSchedulingCompanyDto: CreateSchedulingCompanyDto, token: string): Promise<SchedulingCompany> {
        const requiredFields = ['companyId', 'customerId', 'title', 'startDate', 'endDate', 'startHour', 'endHour'];
        for (const field of requiredFields) {
            if (!createSchedulingCompanyDto[field]) {
                throw new BadRequestException('Todos os campos são obrigatórios!');
            }
        }

        let customer;
        try {
            const response = await this.http.instance.get(`customer/${createSchedulingCompanyDto.customerId}`, {
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
            const response = await this.http.instance.get(`company/${createSchedulingCompanyDto.companyId}`, {
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
    }

    async findAll() {
        return await this.schedulingCompanyModel.findAll();
    }

    async findById(id: number) {
        const schedulingCompany = await this.schedulingCompanyModel.findByPk(id);
        
        if (!schedulingCompany) throw new NotFoundException('Agendamento não encontrado!');
        return schedulingCompany;
    }

    async findByCompanyId(companyId: number) {
        const { data: company } = await this.http.instance.get(`/company/${companyId}`);
        if (!company) {
            throw new NotFoundException('Empresa não encontrada!');
        }

        const schedulings = await this.schedulingCompanyModel.findAll({
            where: { companyId },
            order: [['startDate', 'DESC']],
        });

        if (schedulings.length === 0) {
            return [];
        }

        const customerIds = [...new Set(schedulings.map(scheduling => scheduling.customerId))];
        const customers = await Promise.all(
            customerIds.map(id => this.http.instance.get(`/customer/${id}`).then(res => res.data))
        );

        const customerMap = new Map();
        customers.forEach(c => {
            customerMap.set(c.idCustomer, c);
        });

        const result = schedulings.map(scheduling => {
            const customer = customerMap.get(scheduling.customerId);
            return {
                idScheduling: scheduling.idSchedulingCompany,
                startDate: scheduling.startDate,
                endDate: scheduling.endDate,
                startHour: scheduling.startHour,
                endHour: scheduling.endHour,
                status: scheduling.status,
            company: {
                idCompany: company.idCompany,
                name: company.name,
            },
            customer: customer
                ? {
                    idCustomer: customer.idCustomer,
                    name: customer.name,
                    street: customer.street,
                    number: customer.number,
                    phone: customer.phone
                }
                : null,
            };
        });

        return result;
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

        const validStatuses = [
            SchedulingCompanyStatus.PENDING,
            SchedulingCompanyStatus.CONFIRMED,
            SchedulingCompanyStatus.CANCELLED
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