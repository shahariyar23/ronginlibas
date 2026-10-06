export declare class HealthController {
    checkHealth(): {
        success: boolean;
        message: string;
        data: {
            status: string;
            service: string;
            environment: string;
            timestamp: string;
            uptime: number;
        };
    };
}
