export function courierProviderFactory(configService, steadfastProvider, mockProvider) {
    const mode = (configService.get('STEADFAST_MODE') || 'mock').trim().toLowerCase();
    if (mode === 'live') {
        return steadfastProvider;
    }
    return mockProvider;
}
//# sourceMappingURL=courier-provider.factory.js.map