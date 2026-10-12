'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  MapPin,
  Calculator,
  Package,
  Send,
  ShieldAlert,
  Info,
  Store,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

interface CityOption {
  city_id: number;
  city_name: string;
}

interface ZoneOption {
  zone_id: number;
  zone_name: string;
}

interface AreaOption {
  area_id: number;
  area_name: string;
}

interface StoreOption {
  store_id: number;
  store_name: string;
  store_address: string;
}

export default function PathaoTestPage() {
  return (
    <PermissionGuard permission="settings" moduleName="Store Settings">
      <PathaoTestContent />
    </PermissionGuard>
  );
}

function PathaoTestContent() {
  const { toast } = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'LOCATIONS' | 'PRICE_PLAN' | 'CREATE_ORDER'>('LOCATIONS');

  // Connection & Diagnostics State
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined);

  // Locations State
  const [cities, setCities] = useState<CityOption[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<number | ''>('');

  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<number | ''>('');

  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<number | ''>('');

  // Price Calculation State
  const [priceWeight, setPriceWeight] = useState<number>(0.5);
  const [priceDeliveryType, setPriceDeliveryType] = useState<number>(48);
  const [priceItemType, setPriceItemType] = useState<number>(2);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<{
    price: number;
    plan_id?: number;
    additional_charge?: number;
    discount?: number;
  } | null>(null);

  // Test Order Form State
  const [orderForm, setOrderForm] = useState({
    recipient_name: 'Atelier Test Patron',
    recipient_phone: '01712088866',
    recipient_address: 'House 14, Road 5, Block D, Banani, Dhaka',
    special_instruction: 'Sandbox test parcel — Rongin Libas luxury apparel',
    item_quantity: 1,
    item_weight: 0.5,
    amount_to_collect: 1500,
    item_description: 'Pure Silk Panjabi & Embroidered Shawl',
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [createdParcelResult, setCreatedParcelResult] = useState<{
    consignment_id: string;
    merchant_order_id: string;
    order_status: string;
    delivery_fee?: number;
  } | null>(null);

  // Initial load
  useEffect(() => {
    checkInitialStatus();
  }, []);

  const checkInitialStatus = async () => {
    try {
      const res = await adminApi.pathao.getStatus();
      if (res.success && res.data) {
        setIsConnected(res.data.connected);
        if (res.data.stores && res.data.stores.length > 0) {
          setStores(res.data.stores);
          setSelectedStoreId(res.data.stores[0].store_id);
        }
      }
    } catch {
      setIsConnected(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const res = await adminApi.pathao.testConnection();
      setIsConnected(res.success);
      if (res.success) {
        toast.success(res.message || 'Pathao Sandbox connection active!');
        // Also refresh stores and cities
        loadCities();
        const storeRes = await adminApi.pathao.getStores();
        if (storeRes.success && storeRes.data) {
          setStores(storeRes.data);
          if (storeRes.data.length > 0) setSelectedStoreId(storeRes.data[0].store_id);
        }
      } else {
        toast.error(res.message || 'Connection to Pathao Sandbox failed.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error communicating with Pathao Sandbox.');
      setIsConnected(false);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Location loaders
  const loadCities = async () => {
    setIsLoadingCities(true);
    try {
      const res = await adminApi.pathao.getCities();
      if (res.success && res.data) {
        setCities(res.data);
        toast.success(`Loaded ${res.data.length} sandbox delivery cities`);
      } else {
        toast.error(res.error || 'Failed to fetch cities');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error fetching sandbox cities');
    } finally {
      setIsLoadingCities(false);
    }
  };

  const handleCityChange = async (cityId: number) => {
    setSelectedCityId(cityId);
    setSelectedZoneId('');
    setSelectedAreaId('');
    setZones([]);
    setAreas([]);
    if (!cityId) return;

    setIsLoadingZones(true);
    try {
      const res = await adminApi.pathao.getZones(cityId);
      if (res.success && res.data) {
        setZones(res.data);
      } else {
        toast.error(res.error || 'Failed to fetch zones');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error fetching sandbox zones');
    } finally {
      setIsLoadingZones(false);
    }
  };

  const handleZoneChange = async (zoneId: number) => {
    setSelectedZoneId(zoneId);
    setSelectedAreaId('');
    setAreas([]);
    if (!zoneId) return;

    setIsLoadingAreas(true);
    try {
      const res = await adminApi.pathao.getAreas(zoneId);
      if (res.success && res.data) {
        setAreas(res.data);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error fetching sandbox areas');
    } finally {
      setIsLoadingAreas(false);
    }
  };

  // Price plan calculator
  const handleCalculatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityId || !selectedZoneId) {
      toast.error('Please select both a Destination City and Zone first.');
      return;
    }

    setIsCalculatingPrice(true);
    setCalculatedPrice(null);
    try {
      const res = await adminApi.pathao.calculatePrice({
        store_id: selectedStoreId,
        item_type: priceItemType,
        delivery_type: priceDeliveryType,
        item_weight: priceWeight,
        recipient_city: Number(selectedCityId),
        recipient_zone: Number(selectedZoneId),
      });

      if (res.success && res.data) {
        setCalculatedPrice(res.data);
        toast.success(`Estimated charge: ৳${res.data.price}`);
      } else {
        toast.error(res.error || 'Could not calculate price');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error calculating sandbox delivery fee');
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  // Create test order
  const handleCreateTestOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOrder(true);
    setCreatedParcelResult(null);

    try {
      const res = await adminApi.pathao.createTestOrder({
        store_id: selectedStoreId,
        merchant_order_id: `RL-TEST-${Date.now().toString().slice(-6)}`,
        recipient_name: orderForm.recipient_name,
        recipient_phone: orderForm.recipient_phone,
        recipient_address: orderForm.recipient_address,
        recipient_city: selectedCityId ? Number(selectedCityId) : undefined,
        recipient_zone: selectedZoneId ? Number(selectedZoneId) : undefined,
        recipient_area: selectedAreaId ? Number(selectedAreaId) : undefined,
        delivery_type: priceDeliveryType,
        item_type: 2,
        special_instruction: orderForm.special_instruction,
        item_quantity: Number(orderForm.item_quantity),
        item_weight: Number(orderForm.item_weight),
        amount_to_collect: Number(orderForm.amount_to_collect),
        item_description: orderForm.item_description,
      });

      if (res.success && res.data) {
        setCreatedParcelResult(res.data);
        toast.success(`Sandbox parcel created! Consignment #${res.data.consignment_id}`);
      } else {
        toast.error(res.error || 'Failed to create test sandbox order');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error creating test sandbox order');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const selectedCityName = cities.find((c) => c.city_id === selectedCityId)?.city_name || '';
  const selectedZoneName = zones.find((z) => z.zone_id === selectedZoneId)?.zone_name || '';
  const selectedAreaName = areas.find((a) => a.area_id === selectedAreaId)?.area_name || '';

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#deddd3] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/settings"
              className="inline-flex items-center gap-1 text-xs text-[#717975] hover:text-[#1b1c18] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Settings</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif text-[#1b1c18] tracking-tight">Pathao Sandbox Suite</h1>
            <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-[#c79a45]/20 text-[#8c6722] border border-[#c79a45]/40">
              SANDBOX / TEST
            </span>
          </div>
          <p className="text-xs text-[#69726d] mt-1">
            Complete developer &amp; testing console for Pathao Aladdin Merchant API.
          </p>
        </div>

        {/* Live Status and Test Connection Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 border border-[#deddd3] bg-white text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-[#0d4d3b]' : isConnected === false ? 'bg-[#ba1a1a]' : 'bg-[#c79a45]'
              }`}
            />
            <span className="font-semibold text-[#1b1c18]">
              {isConnected ? 'Connected' : isConnected === false ? 'Not Connected' : 'Checking...'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#073a2d] hover:bg-[#0c4e3b] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Test Connection</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-[#fbf9f2] border-l-4 border-[#c79a45] text-xs text-[#404945] flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#8c6722] flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-[#1b1c18]">
            Sandbox / Testing Mode — No real courier delivery will be created.
          </h3>
          <p className="text-[#69726d] text-xs mt-0.5 leading-relaxed">
            All API calls are directed strictly to Pathao Sandbox endpoints (<code className="font-mono text-[#073a2d]">https://courier-api-sandbox.pathao.com</code>). Consignment IDs generated here are simulated and will never dispatch actual riders.
          </p>
        </div>
      </div>

      {/* Warehouses / Store Selector */}
      {stores.length > 0 && (
        <div className="bg-white border border-[#deddd3] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#073a2d]" />
            <span className="font-semibold text-[#1b1c18]">Merchant Pickup Warehouse:</span>
          </div>
          <select
            value={selectedStoreId || ''}
            onChange={(e) => setSelectedStoreId(Number(e.target.value))}
            className="px-3 py-1.5 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] outline-none font-medium"
          >
            {stores.map((s) => (
              <option key={s.store_id} value={s.store_id}>
                {s.store_name} ({s.store_address || `Store ID: ${s.store_id}`})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#deddd3] bg-white">
        <button
          type="button"
          onClick={() => setActiveTab('LOCATIONS')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTab === 'LOCATIONS'
              ? 'border-[#073a2d] text-[#073a2d] bg-[#fbf9f2]'
              : 'border-transparent text-[#717975] hover:text-[#1b1c18]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-[#c79a45]" />
          <span>1. Location APIs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PRICE_PLAN')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTab === 'PRICE_PLAN'
              ? 'border-[#073a2d] text-[#073a2d] bg-[#fbf9f2]'
              : 'border-transparent text-[#717975] hover:text-[#1b1c18]'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-[#c79a45]" />
          <span>2. Price Plan Calculation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CREATE_ORDER')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTab === 'CREATE_ORDER'
              ? 'border-[#073a2d] text-[#073a2d] bg-[#fbf9f2]'
              : 'border-transparent text-[#717975] hover:text-[#1b1c18]'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-[#c79a45]" />
          <span>3. Create Sandbox Order</span>
        </button>
      </div>

      {/* ================= TAB 1: LOCATION APIS ================= */}
      {activeTab === 'LOCATIONS' && (
        <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0eee7]">
            <div>
              <h2 className="font-serif text-base font-bold text-[#1b1c18]">Pathao Sandbox Location Explorer</h2>
              <p className="text-xs text-[#69726d]">
                Cascade queries from Cities → Zones → Areas using official Aladdin endpoints.
              </p>
            </div>
            <button
              type="button"
              onClick={loadCities}
              disabled={isLoadingCities}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#deddd3] text-xs font-semibold text-[#073a2d] hover:bg-[#fbf9f2] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoadingCities ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>{cities.length > 0 ? 'Refresh Cities' : 'Fetch Sandbox Cities'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. City */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975]">
                1. Delivery City {cities.length > 0 && `(${cities.length})`}
              </label>
              <select
                value={selectedCityId}
                onChange={(e) => handleCityChange(Number(e.target.value))}
                disabled={cities.length === 0 || isLoadingCities}
                className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] outline-none disabled:opacity-50"
              >
                <option value="">{cities.length === 0 ? 'Click Fetch Sandbox Cities above' : 'Select a City'}</option>
                {cities.map((city) => (
                  <option key={city.city_id} value={city.city_id}>
                    {city.city_name} (ID: {city.city_id})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Zone */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975]">
                2. Zone {zones.length > 0 && `(${zones.length})`}
              </label>
              <select
                value={selectedZoneId}
                onChange={(e) => handleZoneChange(Number(e.target.value))}
                disabled={!selectedCityId || isLoadingZones}
                className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] outline-none disabled:opacity-50"
              >
                <option value="">
                  {isLoadingZones ? 'Loading zones...' : zones.length === 0 ? 'Select a city first' : 'Select a Zone'}
                </option>
                {zones.map((zone) => (
                  <option key={zone.zone_id} value={zone.zone_id}>
                    {zone.zone_name} (ID: {zone.zone_id})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Area */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975]">
                3. Area {areas.length > 0 && `(${areas.length})`}
              </label>
              <select
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(Number(e.target.value))}
                disabled={!selectedZoneId || isLoadingAreas}
                className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] outline-none disabled:opacity-50"
              >
                <option value="">
                  {isLoadingAreas ? 'Loading areas...' : areas.length === 0 ? 'Select a zone first' : 'Select an Area'}
                </option>
                {areas.map((area) => (
                  <option key={area.area_id} value={area.area_id}>
                    {area.area_name} (ID: {area.area_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active selection summary */}
          {selectedCityId && (
            <div className="p-4 bg-[#fbfaf8] border border-[#deddd3] text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-[#073a2d]">
                <CheckCircle2 className="w-4 h-4 text-[#073a2d]" />
                <span>Active Geographic Resolution:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#404945]">
                <span className="bg-white border border-[#deddd3] px-2 py-1">
                  City: <strong>{selectedCityName}</strong> (ID: {selectedCityId})
                </span>
                {selectedZoneId && (
                  <>
                    <ChevronRight className="w-3 h-3 text-[#717975]" />
                    <span className="bg-white border border-[#deddd3] px-2 py-1">
                      Zone: <strong>{selectedZoneName}</strong> (ID: {selectedZoneId})
                    </span>
                  </>
                )}
                {selectedAreaId && (
                  <>
                    <ChevronRight className="w-3 h-3 text-[#717975]" />
                    <span className="bg-white border border-[#deddd3] px-2 py-1">
                      Area: <strong>{selectedAreaName}</strong> (ID: {selectedAreaId})
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PRICE PLAN ================= */}
      {activeTab === 'PRICE_PLAN' && (
        <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-6">
          <div className="pb-3 border-b border-[#f0eee7]">
            <h2 className="font-serif text-base font-bold text-[#1b1c18]">Pathao Sandbox Price Calculation</h2>
            <p className="text-xs text-[#69726d]">
              Official POST <code>/aladdin/api/v1/merchant/price-plan</code> estimate based on parcel dimensions.
            </p>
          </div>

          <form onSubmit={handleCalculatePrice} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Destination City & Zone */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                    Destination City *
                  </label>
                  <select
                    value={selectedCityId}
                    onChange={(e) => handleCityChange(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] outline-none"
                  >
                    <option value="">{cities.length === 0 ? 'Click Fetch Cities in Tab 1' : 'Select City'}</option>
                    {cities.map((city) => (
                      <option key={city.city_id} value={city.city_id}>
                        {city.city_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                    Destination Zone *
                  </label>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(Number(e.target.value))}
                    required
                    disabled={!selectedCityId}
                    className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] outline-none disabled:opacity-50"
                  >
                    <option value="">{zones.length === 0 ? 'Select city first' : 'Select Zone'}</option>
                    {zones.map((zone) => (
                      <option key={zone.zone_id} value={zone.zone_id}>
                        {zone.zone_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Weight & Options */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                    Item Weight (KG) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="50"
                    value={priceWeight}
                    onChange={(e) => setPriceWeight(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] font-mono outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                      Delivery Type
                    </label>
                    <select
                      value={priceDeliveryType}
                      onChange={(e) => setPriceDeliveryType(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] outline-none"
                    >
                      <option value={48}>Normal (48 Hours)</option>
                      <option value={12}>On Demand (12 Hours)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                      Item Type
                    </label>
                    <select
                      value={priceItemType}
                      onChange={(e) => setPriceItemType(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] outline-none"
                    >
                      <option value={2}>Parcel (Apparel)</option>
                      <option value={1}>Document</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#deddd3]">
              <span className="text-[11px] text-[#717975]">
                Source of truth directly from Pathao Sandbox API.
              </span>

              <button
                type="submit"
                disabled={isCalculatingPrice || !selectedCityId || !selectedZoneId}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#073a2d] hover:bg-[#0c4e3b] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isCalculatingPrice ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Querying Pathao Plan...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Calculate Estimated Charge</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Result Card */}
          {calculatedPrice && (
            <div className="p-5 bg-[#fbfaf8] border-2 border-[#073a2d]/30 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#717975] tracking-widest block">
                    PATHAO SANDBOX OFFICIAL TARIFF
                  </span>
                  <p className="text-2xl font-serif font-black text-[#073a2d] mt-0.5">
                    ৳{calculatedPrice.price.toLocaleString()}
                  </p>
                </div>
                <div className="text-right text-[11px] text-[#69726d] space-y-0.5">
                  <p>Destination: <strong className="text-[#1b1c18]">{selectedCityName} → {selectedZoneName}</strong></p>
                  <p>Weight: <strong className="text-[#1b1c18]">{priceWeight} KG</strong></p>
                  <p>Type: <strong className="text-[#1b1c18]">{priceDeliveryType === 48 ? 'Normal (48h)' : 'On Demand (12h)'}</strong></p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: CREATE TEST ORDER ================= */}
      {activeTab === 'CREATE_ORDER' && (
        <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-6">
          <div className="pb-3 border-b border-[#f0eee7]">
            <h2 className="font-serif text-base font-bold text-[#1b1c18]">Create Sandbox Test Order</h2>
            <p className="text-xs text-[#69726d]">
              Calls <code>POST /aladdin/api/v1/orders</code> on Pathao Sandbox to book an authentic test consignment.
            </p>
          </div>

          <form onSubmit={handleCreateTestOrder} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Recipient Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={orderForm.recipient_name}
                  onChange={(e) => setOrderForm({ ...orderForm, recipient_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] outline-none"
                />
              </div>

              {/* Recipient Phone */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                  Recipient Mobile (11 digits, BD) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="017xxxxxxxx"
                  value={orderForm.recipient_phone}
                  onChange={(e) => setOrderForm({ ...orderForm, recipient_phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] font-mono outline-none"
                />
              </div>

              {/* Recipient Physical Address */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                  Full Physical Delivery Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={orderForm.recipient_address}
                  onChange={(e) => setOrderForm({ ...orderForm, recipient_address: e.target.value })}
                  placeholder="House number, road number, block, area, and landmark"
                  className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] outline-none"
                />
              </div>

              {/* Garment Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                  Item Description *
                </label>
                <input
                  type="text"
                  required
                  value={orderForm.item_description}
                  onChange={(e) => setOrderForm({ ...orderForm, item_description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] outline-none"
                />
              </div>

              {/* Amount to collect (COD) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                  Amount to Collect (COD ৳) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={orderForm.amount_to_collect}
                  onChange={(e) => setOrderForm({ ...orderForm, amount_to_collect: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] font-mono outline-none"
                />
                <span className="text-[10px] text-[#717975] mt-0.5 block">0 if order is already prepaid</span>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={orderForm.item_quantity}
                  onChange={(e) => setOrderForm({ ...orderForm, item_quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] font-mono outline-none"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                  Weight (KG) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={orderForm.item_weight}
                  onChange={(e) => setOrderForm({ ...orderForm, item_weight: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] font-mono outline-none"
                />
              </div>

              {/* Special Instructions */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#717975] mb-1">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={orderForm.special_instruction}
                  onChange={(e) => setOrderForm({ ...orderForm, special_instruction: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#deddd3]">
              <span className="text-[11px] text-[#717975] italic">
                Only creates a test booking on Pathao Sandbox. No real pickup dispatch.
              </span>

              <button
                type="submit"
                disabled={isSubmittingOrder}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#073a2d] hover:bg-[#0c4e3b] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSubmittingOrder ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Booking Sandbox Parcel...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Create Sandbox Order</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Success Response Display */}
          {createdParcelResult && (
            <div className="p-5 bg-[#b0ecd3]/20 border border-[#0d4d3b]/40 text-xs space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-[#073a2d] font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-[#0d4d3b]" />
                <span>Pathao Sandbox Consignment Generated Successfully</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 border border-[#deddd3]">
                <div>
                  <span className="text-[10px] text-[#717975] uppercase font-bold block">Consignment ID</span>
                  <span className="font-mono font-black text-[#073a2d] text-sm">
                    {createdParcelResult.consignment_id}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#717975] uppercase font-bold block">Merchant Order ID</span>
                  <span className="font-mono text-[#1b1c18]">
                    {createdParcelResult.merchant_order_id}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#717975] uppercase font-bold block">Courier Status</span>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-[#fbf9f2] border border-[#c79a45] text-[#8c6722]">
                    {createdParcelResult.order_status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#717975] uppercase font-bold block">Estimated Delivery Fee</span>
                  <span className="font-semibold text-[#1b1c18]">
                    ৳{createdParcelResult.delivery_fee ?? 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
