import { Table, Column, Model, DataType } from 'sequelize-typescript';

export enum SchedulingCompanyStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED'
}

export interface SchedulingCompanyCreationAttributes {
    companyId: number;
    customerId: number;
    title: string;
    startDate: Date;
    endDate: Date;
    startHour: string;
    endHour: string;
    status: SchedulingCompanyStatus;
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
        field: 'customerId'
    })
    declare customerId: number;

    @Column({ 
        type: DataType.STRING,
        allowNull: false 
    })
    declare title: string;

    @Column({ 
        type: DataType.DATE,
        allowNull: false 
    })
    declare startDate: Date;

    @Column({ 
        type: DataType.DATE,
        allowNull: false 
    })
    declare endDate: Date;

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
        type: DataType.ENUM(...Object.values(SchedulingCompanyStatus)),
        allowNull: false,
        defaultValue: SchedulingCompanyStatus.PENDING
    })
    declare status: SchedulingCompanyStatus;
}