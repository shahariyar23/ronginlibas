import { ConfigService } from '@nestjs/config';
import { CourierProvider } from '../interfaces/courier-provider.interface.js';
import { SteadfastCourierProvider } from './steadfast.provider.js';
import { MockSteadfastCourierProvider } from './mock-steadfast.provider.js';
export declare function courierProviderFactory(configService: ConfigService, steadfastProvider: SteadfastCourierProvider, mockProvider: MockSteadfastCourierProvider): CourierProvider;
