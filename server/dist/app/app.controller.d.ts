export declare class AppController {
    getRoot(): {
        success: boolean;
        message: string;
        data: {
            status: string;
            service: string;
            environment: string;
            documentation: string;
            healthCheck: string;
            timestamp: string;
        };
    };
}
