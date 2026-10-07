export declare class RegisterCustomerDto {
    phone: string;
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    confirmPassword: string;
    preferredSize?: string;
    preferredFit?: string;
    termsAccepted: boolean;
    marketingConsent?: boolean;
}
