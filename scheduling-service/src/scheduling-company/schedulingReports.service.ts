import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { SchedulingCompany, SchedulingCompanyStatus } from './schedulingCompany.model';
import { HttpService } from 'src/http/http.service';
import { RedisService } from 'src/redis/redis.service';

export interface CompanyResponse {
    idCompany: number;
    name: string;
}

@Injectable()
export class SchedulingCompletedService {
    constructor(
        @InjectModel(SchedulingCompany) private schedulingCompanyModel: typeof SchedulingCompany,
        private http: HttpService,
        private redis: RedisService
    ) {}

    async findByServiceCompleted(companyId: number, month: string, year: number, token: string) {
        if (!companyId) {
            throw new BadRequestException("O ID da empresa é obrigatório!");
        }

        const cacheKey = `reports:${companyId}:${month}:${year}`;

        try {
            const cache = await this.redis.getClient();

            const pong = await cache.ping();
            console.log("Redis ping response:", pong);

            const cachedData = await cache.get(cacheKey);
            if (cachedData) {
                console.log(`♻️ Retornando relatórios da empresa do cache (${cacheKey})`);
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
            company,
            total: totalScheduling
        };

        try {
            await this.redis.getClient().set(cacheKey, JSON.stringify(result), 'EX', 300);
            console.log(`💾 Dados dos relatórios da empresa salvos no cache (${cacheKey}) com TTL de 300s`);
        } catch(error) {
            console.log("❌ Erro ao salvar no cache:", error);
        }

        return result;
    }

    async invalidateReportsCacheById(companyId: number) {
        const pattern = `reports:${companyId}*`;
        const keys = await this.redis.getClient().keys(pattern);

        for (const key of keys) {
            await this.redis.getClient().del(key);
            console.log(`🗑️ Cache dos relatórios invalidado: ${key}`);
        }
    }
}