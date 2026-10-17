import { ConfigService } from '@nestjs/config';
import { CourierProvider } from '../interfaces/courier-provider.interface.js';
import { SteadfastCourierProvider } from './steadfast.provider.js';
import { MockSteadfastCourierProvider } from './mock-steadfast.provider.js';

export function courierProviderFactory(
  configService: ConfigService,
  steadfastProvider: SteadfastCourierProvider,
  mockProvider: MockSteadfastCourierProvider,
): CourierProvider {
  const mode = (configService.get<string>('STEADFAST_MODE') || 'mock').trim().toLowerCase();
  if (mode === 'live') {
    return steadfastProvider;
  }
  return mockProvider;
}
