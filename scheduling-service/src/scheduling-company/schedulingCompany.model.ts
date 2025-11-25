import { Table, Column, Model, DataType } from 'sequelize-typescript';

export enum SchedulingCompanyStatus {
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED'
}

export interface SchedulingCompanyCreationAttributes {
    companyId: number;
    customerId: number;
    schedulingCustomerId: number;
    title: string;
    startDate: string;
    endDate: string;
    startHour: string;
    endHour: string;
    budget: number;
    status: SchedulingCompanyStatus;
    notificationSent: boolean;
    lastExtension: Date;
}

@Table({ tableName: 'SchedulingCompany', timestamps: false, modelName: 'SchedulingCompany' })
export class SchedulingCompany extends Model<SchedulingCompany, SchedulingCompanyCreationAttributes> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'idSchedulingCompany'
    })
    declare idSchedulingCompany: number;

    @Column({ 
        type: DataType.INTEGER,
        allowNull: false,
        field: 'companyId'
    })
    declare companyId: number;

    @Column({ 
        type: DataType.INTEGER,
        allowNull: false,
        field: 'schedulingCustomerId'
    })
    declare schedulingCustomerId: number;

    @Column({ 
        type: DataType.INTEGER,
        allowNull: false,
        field: 'customerId'
    })
    declare customerId: number;

    @Column({ 
        type: DataType.STRING,
        allowNull: false 
    })
    declare title: string;

    @Column({ 
        type: DataType.STRING,
        allowNull: false 
    })
    declare startDate: string;

    @Column({ 
        type: DataType.STRING,
        allowNull: false 
    })
    declare endDate: string;

    @Column({ 
        type: DataType.STRING,
        allowNull: false 
    })
    declare startHour: string;

    @Column({ 
        type: DataType.STRING,
        allowNull: false 
    })
    declare endHour: string;

    @Column({ 
        type: DataType.FLOAT,
        allowNull: true 
    })
    declare budget: number;

    @Column({ 
        type: DataType.ENUM(...Object.values(SchedulingCompanyStatus)),
        allowNull: false,
        defaultValue: SchedulingCompanyStatus.CONFIRMED
    })
    declare status: SchedulingCompanyStatus;

    @Column({
    type: DataType.BOOLEAN,
        defaultValue: false,
    })
    notificationSent: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    declare lastExtension: Date;
}