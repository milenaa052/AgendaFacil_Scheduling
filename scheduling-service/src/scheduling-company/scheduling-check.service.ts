import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { SchedulingCompany } from './schedulingCompany.model';
import { HttpService } from 'src/http/http.service';
import { CustomerResponse, CompanyResponse } from './schedulingCompany.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SchedulingCheckService {
    private systemAuthHeaders: { headers: { Authorization: string } };

    constructor(
        @InjectModel(SchedulingCompany)
        private schedulingModel: typeof SchedulingCompany,
        private http: HttpService,
        private configService: ConfigService
    ) {
        const systemToken = this.configService.get<string>('SERVICE_AUTH_TOKEN'); 

        if (!systemToken) {
            console.error('🚨 [ERRO CRON] SERVICE_AUTH_TOKEN não configurado. As requisições falharão.');
        }

        this.systemAuthHeaders = { 
            headers: { Authorization: `Bearer ${systemToken}` } 
        };
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async checkFinishedServices() {
        console.log('Executando verificação de serviços finalizados...');
        
        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60000);

        const schedulings = await this.schedulingModel.findAll({
            where: { 
                status: 'CONFIRMED',
                notificationSent: false
            }
        });

        const authHeaders = this.systemAuthHeaders; 

        if (!this.systemAuthHeaders.headers.Authorization) {
            console.log('Verificação interrompida: Token de serviço não disponível.');
            return;
        }

        for (const sch of schedulings) {

            if (sch.lastExtension && sch.lastExtension > tenMinutesAgo) {
                console.log("Ignorando, ainda está dentro da janela de extensão");
                continue;
            }
        
            try {
                const endDate = new Date(`${sch.endDate}T${sch.endHour}:00-03:00`);

                if (isNaN(endDate.getTime())) {
                    throw new Error("Data final inválida.");
                }

                const tenMinutesAfter = new Date(endDate.getTime() + 10 * 60000);

                console.log(`Agendamento ${sch.idSchedulingCompany} - Término Previsto (UTC): ${endDate.toISOString()}`);
                console.log(`Agendamento ${sch.idSchedulingCompany} - 10min Após (UTC): ${tenMinutesAfter.toISOString()}`);

                if (now.getTime() < tenMinutesAfter.getTime()) continue;

            } catch (dateError) {
                console.error(`Erro ao processar data/hora do agendamento ${sch.idSchedulingCompany}:`, sch.endDate, sch.endHour, dateError);
                continue;
            }
        
            console.log(`Agendamento ${sch.idSchedulingCompany} elegível para notificação.`);

            let company: CompanyResponse;
            try {
                const response = await this.http.users.get<CompanyResponse>(`company/${sch.companyId}`, authHeaders);
                company = response.data;
            } catch (err) {
                console.error(
                    `Erro ao buscar empresa ${sch.companyId} para agendamento ${sch.idSchedulingCompany}:`,
                    err.response?.data?.message || err.message
                );
                continue;
            }

            let customerData: CustomerResponse;
            try {
                const response = await this.http.users.get<CustomerResponse>(`customer/${sch.customerId}`, authHeaders);
                customerData = response.data;
            } catch (err) {
                console.error(
                    `Erro ao buscar cliente ${sch.customerId} para agendamento ${sch.idSchedulingCompany}:`,
                    err.response?.data?.message || err.message
                );
                continue;
            }

            const payload = {
                companyId: sch.companyId,
                customerId: sch.customerId,
                type: 'Serviço Finalizado?',
                text: `O serviço agendado para ${customerData.name} estava previsto para terminar às ${sch.endHour}. O serviço foi concluído?`,
                street: customerData.street,
                number: customerData.number,
                schedulingCompanyId: sch.idSchedulingCompany,
                schedulingDate: sch.startDate,
                schedulingStartTime: sch.startHour,
                schedulingEndTime: sch.endHour,
                date: new Date()
            };

            try {
                await this.http.notifications.post(
                    `notifications-company`,
                    payload,
                    authHeaders
                );

                console.log("Notificação criada para o agendamento:", sch.idSchedulingCompany);
                
                await this.schedulingModel.update(
                    { notificationSent: true }, 
                    { where: { idSchedulingCompany: sch.idSchedulingCompany } }
                );

                console.log(`Agendamento ${sch.idSchedulingCompany} marcado como notificado.`);
            } catch (err) {
                console.error('Erro ao criar notificação para o agendamento:', sch.idSchedulingCompany, err.response?.data || err);
                continue;
            }
        }

        console.log('Verificação de serviços finalizados concluída.');
    }
}