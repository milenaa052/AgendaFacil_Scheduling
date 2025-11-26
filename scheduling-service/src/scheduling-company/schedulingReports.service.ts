import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { SchedulingCompany, SchedulingCompanyStatus } from './schedulingCompany.model';
import { HttpService } from 'src/http/http.service';

export interface CompanyResponse {
    idCompany: number;
    name: string;
}

@Injectable()
export class ReportsService {
    constructor(
        @InjectModel(SchedulingCompany) private schedulingCompanyModel: typeof SchedulingCompany,
        private http: HttpService,
    ) {}

    async findByServiceCompleted(companyId: number, month: string, year: number, token: string) {
        if (!companyId) {
            throw new BadRequestException("O ID da empresa é obrigatório!");
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
            where: {
                companyId,
                status: {
                    [Op.or]: [
                        SchedulingCompanyStatus.COMPLETED,
                        SchedulingCompanyStatus.CONFIRMED
                    ]
                },
                startDate: {
                    [Op.like]: `${year}-${String(month).padStart(2, "0")}%`
                }
            }
        });

        if (schedulings.length === 0) {
            return { total: 0 };
        }

        const totalScheduling = schedulings.length;

        const result = {
            totalScheduling: totalScheduling
        };

        return result;
    }

    async findByTotalBudget(companyId: number, month: string, year: number, token: string) {
        if (!companyId) {
            throw new BadRequestException("O ID da empresa é obrigatório!");
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
            where: {
                companyId,
                startDate: {
                    [Op.like]: `${year}-${String(month).padStart(2, "0")}%`
                }
            }
        });

        if (schedulings.length === 0) {
            return { total: 0 };
        }

        const totalBudget = schedulings.reduce((sum, s) => {
            return sum + (s.budget ? Number(s.budget) : 0);
        }, 0);

        const result = {
            totalBudget: totalBudget
        };

        return result;
    }
}