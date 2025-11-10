import { Table, Column, Model, DataType } from 'sequelize-typescript';

export enum SchedulingCustomerStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED'
}

export interface SchedulingCustomerCreationAttributes {
    companyId: number;
    customerId: number;
    title: string;
    startDate: string;
    endDate: string;
    startHour: string;
    endHour: string;
    status: SchedulingCustomerStatus;
}

@Table({ tableName: 'SchedulingCustomer', timestamps: false, modelName: 'SchedulingCustomer' })
export class SchedulingCustomer extends Model<SchedulingCustomer, SchedulingCustomerCreationAttributes> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'idSchedulingCustomer'
    })
    declare idSchedulingCustomer: number;

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
        type: DataType.ENUM(...Object.values(SchedulingCustomerStatus)),
        allowNull: false,
        defaultValue: SchedulingCustomerStatus.PENDING
    })
    declare status: SchedulingCustomerStatus;
}