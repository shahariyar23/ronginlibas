'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Award, Mail, Phone, MapPin, Download } from 'lucide-react';

interface Patron {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  tier: 'VIP Patron' | 'Atelier Regular' | 'New Client';
  ordersCount: number;
  totalSpent: number;
  lastOrder: string;
}

const PATRONS: Patron[] = [];

import { adminApi } from '@/lib/api';

export default function CustomersPage() {
  const [patrons, setPatrons] = useState<Patron[]>(PATRONS);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await adminApi.customers.getAll();
        if (res.success && res.data?.items?.length > 0) {
          const mapped: Patron[] = res.data.items.map((c: any) => {
            const name = `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Patron Client';
            const orders = c.orders || [];
            const ordersCount = c._count?.orders ?? orders.length ?? 0;
            const totalSpent = orders.reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);
            const address = c.addresses?.[0]
              ? `${c.addresses[0].city || ''}${c.addresses[0].division ? `, ${c.addresses[0].division}` : ''}`
              : '—';

            return {
              id: c.id,
              name,
              email: c.email || '—',
              phone: c.phone || '—',
              location: address,
              tier: ordersCount >= 5 ? 'VIP Patron' : ordersCount > 0 ? 'Atelier Regular' : 'New Client',
              ordersCount,
              totalSpent,
              lastOrder: c.orders?.[0]?.createdAt
                ? new Date(c.orders[0].createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : 'Active Ledger',
            };
          });
          setPatrons(mapped);
        }
      } catch (err) {
        console.warn('Customers API fetch fallback:', err);
      }
    }
    loadCustomers();
  }, []);

  const filtered = patrons.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#deddd3] pb-6">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975]">
            ATELIER CLIENTELE ROSTER • BANGLADESH
          </span>
          <h1 className="text-3xl font-serif text-[#1b1c18] mt-1 tracking-tight">Customers</h1>
          <p className="text-xs text-[#69726d] mt-1">
            Registered patrons, VIP bespoke clientele, and lifetime luxury acquisition records.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting Clientele Ledger...')}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#073a2d] text-xs font-semibold uppercase tracking-wider text-[#073a2d] hover:bg-[#073a2d] hover:text-white transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Roster</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-[#deddd3] p-4 flex items-center justify-between shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#717975] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patrons by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden placeholder-[#717975]"
          />
        </div>
      </div>

      {/* Patrons Table */}
      <div className="bg-white border border-[#deddd3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#deddd3] bg-[#fbf9f2] text-[#717975] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-semibold">PATRON</th>
                <th className="py-3 px-4 font-semibold">CONTACT & LOCATION</th>
                <th className="py-3 px-4 font-semibold">TIER STATUS</th>
                <th className="py-3 px-4 font-semibold">ORDERS</th>
                <th className="py-3 px-4 font-semibold">LIFETIME SPEND</th>
                <th className="py-3 px-4 text-right font-semibold">LAST PURCHASE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee7]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#717975]">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#717975]" />
                    <p className="font-serif text-sm text-[#1b1c18]">No patrons found</p>
                    <p className="text-[11px] text-[#717975]">Clientele records will appear here as orders are placed.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((patron) => (
                  <tr key={patron.id} className="hover:bg-[#fbf9f2] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#073a2d] text-white flex items-center justify-center font-bold text-xs">
                          {patron.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1b1c18]">{patron.name}</p>
                          <p className="text-[11px] font-mono text-[#717975]">{patron.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[#404945]">
                        <Phone className="w-3 h-3 text-[#717975]" />
                        <span className="font-mono text-[11px]">{patron.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#69726d]">
                        <MapPin className="w-3 h-3 text-[#717975]" />
                        <span>{patron.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          patron.tier === 'VIP Patron'
                            ? 'bg-[#f5eedf] text-[#8c6722]'
                            : patron.tier === 'Atelier Regular'
                            ? 'bg-[#bcedda]/40 text-[#073a2d]'
                            : 'bg-[#f0eee7] text-[#404945]'
                        }`}
                      >
                        <Award className="w-3 h-3" />
                        {patron.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1b1c18]">{patron.ordersCount} orders</td>
                    <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#073a2d]">
                      ৳{patron.totalSpent.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#717975]">{patron.lastOrder}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
