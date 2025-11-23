import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class HttpService {

    private usersClient: AxiosInstance;
    private notificationsClient: AxiosInstance;

    constructor(cfg: ConfigService) {

        this.usersClient = axios.create({
            baseURL: cfg.get('USERS_API', 'http://service-users:3000'),
            timeout: 5000,
        });

        this.notificationsClient = axios.create({
            baseURL: cfg.get('NOTIFICATIONS_API', 'http://service-notifications:3000'),
            timeout: 5000,
        });
    }

    get users() {
        return this.usersClient;
    }

    get notifications() {
        return this.notificationsClient;
    }
}