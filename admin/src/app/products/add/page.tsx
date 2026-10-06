'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Check,
  X,
  Plus,
  Percent,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { AdminProduct } from '@/data/adminData';

export default function AddProductPage() {
  const router = useRouter();
  const { addProduct } = useAdmin();

  // Form states
  const [title, setTitle] = useState('Imperial Zari Embroidered Panjabi - Heritage Olive');
  const [category, setCategory] = useState('Panjabi');
  const [fabricNote, setFabricNote] = useState('100% Giza Egyptian Combed Cotton');
  const [description, setDescription] = useState(
    'Handcrafted for solemn evening gatherings and celebratory Eid assemblies. Tailored from premium 120s double-ply combed Egyptian cotton with a silken mercerized luster.\n\nFeatures bespoke tone-on-tone fine zari embroidery across the Mandarin band collar, concealed placket, and notched cuffs. Includes mother-of-pearl buttons with hand-stitched bar tacks.'
  );

  // Pricing
  const [regularPrice, setRegularPrice] = useState('3850');
  const [promotionalPrice, setPromotionalPrice] = useState('3450');
  const [costOfGoods, setCostOfGoods] = useState('1620');

  // Inventory
  const [sku, setSku] = useState('RL-PNJ-25-C');
  const [barcode, setBarcode] = useState('89430250918');
  const [aggregateStock, setAggregateStock] = useState('42');
  const [alertThreshold, setAlertThreshold] = useState('6');

  // Sizing selections
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['38"', '40"', '42"', '44"']);
  const availableSizes = ['38"', '40"', '42"', '44"', 'XXL 46"'];

  // Shades
  const [selectedShades, setSelectedShades] = useState([
    { name: 'Heritage Olive', hex: '#073A2D' },
    { name: 'Midnight Navy', hex: '#0F1A2C' },
  ]);

  // Tags
  const [tags, setTags] = useState([
    'EID 2026',
    'EGYPTIAN COTTON',
    'ZARI WORK',
    'NEW ARRIVAL',
    'HERITAGE ATELIER',
  ]);
  const [tagInput, setTagInput] = useState('');

  // Publishing
  const [lifecycleState, setLifecycleState] = useState('Active');
  const [isFeatured, setIsFeatured] = useState(true);

  // Images
  const [images] = useState([
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDsI5ug241TvsSl6uRptjdZWUUmaLTgXRnq-N6fF3plJmG4bX3qnBL96Zj__lAnv6CmmwMSQvs3jE80Mo33uOIdI455vzCYnNF5aSZaVZ7WvS6KxN9jTrnGo62nMOazBMaiMY5oZPmH-GfoBuAOBSQe_gCSdPpN2H290wtqPtQXsgN_xpV5ptQbaKzZhRMATVIbDQffLn3YH4UMuADiWsJLKwNKhuVwh9gtoCYuZCNyLI1FNDePkmyH0w',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA-PIsbLozCP5fnpvyZ-k60kSTLBh4QX1LmsfLPxmt-js88mmKtE2qsMWHQRxTclOzk2nH_Edm1dm6DiBTlzgwzjmEcVhTDrp9Z-lWVGQ_H6ybcjFhK-CKWG5fqds4Zg3GI_epoqzp89xlIJoGPexlm7WJtsBd-gLnyAfwvodB74CkRDWpiY_khKFKpNLI3ZeK7GK2_EaNpmgAxyp1vNVSOo90BFu53oKE_Cc7rG3rsCZ4kwW1HJcC7kQ',
  ]);

  // Gross margin calculation
  const regNum = parseFloat(promotionalPrice || regularPrice) || 0;
  const costNum = parseFloat(costOfGoods) || 0;
  const grossMargin = regNum > 0 ? (((regNum - costNum) / regNum) * 100).toFixed(1) : '0.0';

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleSave = (publish: boolean = true) => {
    const newProduct: AdminProduct = {
      id: `p-${Date.now()}`,
      name: title,
      sku: sku,
      category: category,
      price: parseFloat(promotionalPrice) || parseFloat(regularPrice) || 3450,
      promotionalPrice: parseFloat(promotionalPrice) || undefined,
      costOfGoods: parseFloat(costOfGoods) || undefined,
      stock: parseInt(aggregateStock, 10) || 42,
      status: publish ? 'Active' : 'Low Stock',
      image: images[0],
      fabricNote: fabricNote,
      description: description,
      tags: tags,
      featured: isFeatured,
    };

    addProduct(newProduct);
    alert('Atelier Suite: Product successfully preserved and added to master catalog!');
    router.push('/products');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#717975] hover:text-[#073a2d] font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products / CATALOGUE ENTRY</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2 border-b border-[#deddd3] pb-5">
          <div>
            <h1 className="text-3xl font-serif text-[#1b1c18] tracking-tight">Add New Product</h1>
            <p className="text-xs text-[#69726d] mt-1">
              Configure atelier specifications, sartorial details, and multi-tier variant inventory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave(false)}
              className="px-4 py-2.5 border border-[#deddd3] bg-white text-xs font-semibold uppercase tracking-wider text-[#404945] hover:bg-[#f0eee7] transition-colors"
            >
              SAVE AS DRAFT
            </button>
            <button
              onClick={() => handleSave(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>SAVE & PUBLISH</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Form Sections */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 01: General Information */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
              <h2 className="font-serif text-lg font-medium text-[#1b1c18] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#c79a45]" />
                <span>General Information</span>
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] font-mono">
                SECTION 01
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                Product Title <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Imperial Zari Embroidered Panjabi - Heritage Olive"
                className="w-full mt-1.5 px-3.5 py-2.5 bg-[#fbf9f2] border border-[#deddd3] text-sm text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-medium"
              />
              <p className="text-[11px] text-[#717975] mt-1">
                Include fabric, artisanal craft, or primary tone for optimized searchability.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                  Apparel Category <span className="text-[#ba1a1a]">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                >
                  <option value="Panjabi">Panjabi (Bespoke & RTW)</option>
                  <option value="Shirts">Shirts (Formal & Atelier)</option>
                  <option value="Polo">Polos (Mercerized Knit)</option>
                  <option value="Trousers">Trousers (Churidar & Tailored)</option>
                  <option value="T-Shirts">T-Shirts (Architectural Cotton)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                  Fabric Note / Subtitle
                </label>
                <input
                  type="text"
                  value={fabricNote}
                  onChange={(e) => setFabricNote(e.target.value)}
                  placeholder="100% Giza Egyptian Combed Cotton"
                  className="w-full mt-1.5 px-3 py-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                />
              </div>
            </div>

            {/* Rich Text Editor for Narrative */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                  Editorial Narrative & Sartorial Specifications
                </label>
                <span className="text-[10px] text-[#717975] uppercase">Rich Text Mode</span>
              </div>

              {/* Editor Toolbar */}
              <div className="border border-[#deddd3] bg-white">
                <div className="flex items-center gap-1 p-2 border-b border-[#deddd3] bg-[#fbf9f2] text-[#404945]">
                  <button type="button" className="p-1 hover:bg-[#e4e2dc]">
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1 hover:bg-[#e4e2dc]">
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1 hover:bg-[#e4e2dc]">
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-px h-3.5 bg-[#deddd3] mx-1" />
                  <button type="button" className="p-1 hover:bg-[#e4e2dc]">
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1 hover:bg-[#e4e2dc]">
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-px h-3.5 bg-[#deddd3] mx-1" />
                  <button type="button" className="p-1 hover:bg-[#e4e2dc]">
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1 hover:bg-[#e4e2dc]">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 text-xs text-[#1b1c18] bg-white focus:outline-hidden leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 02: Pricing & Valuation */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
              <h2 className="font-serif text-lg font-medium text-[#1b1c18] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#c79a45]" />
                <span>Pricing & Valuation</span>
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] font-mono">
                SECTION 02
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                  Regular Price (BDT ৳) <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#717975]">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-sm font-semibold text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono"
                  />
                </div>
                <span className="text-[10px] text-[#717975] mt-1 block">Customer retail baseline</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                  Promotional Price (BDT ৳)
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#717975]">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={promotionalPrice}
                    onChange={(e) => setPromotionalPrice(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-sm font-semibold text-[#073a2d] focus:border-[#073a2d] outline-hidden font-mono"
                  />
                </div>
                <span className="text-[10px] text-[#717975] mt-1 block">Active markdown on storefront</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                  Cost of Goods (BDT ৳)
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#717975]">
                    ৳
                  </span>
                  <input
                    type="number"
                    value={costOfGoods}
                    onChange={(e) => setCostOfGoods(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-sm font-semibold text-[#1b1c18] focus:border-[#073a2d] outline-hidden font-mono"
                  />
                </div>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-[#0d4d3b] font-medium">
                  <Percent className="w-3 h-3" />
                  <span>Estimated gross margin: <strong>{grossMargin}%</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 03: Inventory & Identification */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
              <h2 className="font-serif text-lg font-medium text-[#1b1c18] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#c79a45]" />
                <span>Inventory & Identification</span>
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] font-mono">
                SECTION 03
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                  SKU Identifier <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs font-mono font-semibold text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                  Barcode / UPC
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs font-mono text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                  Aggregate Stock
                </label>
                <input
                  type="number"
                  value={aggregateStock}
                  onChange={(e) => setAggregateStock(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs font-mono font-semibold text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                  Alert Threshold
                </label>
                <input
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs font-mono text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 04: Variants Matrix & Atelier Sizing */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
              <h2 className="font-serif text-lg font-medium text-[#1b1c18] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#c79a45]" />
                <span>Variants Matrix & Atelier Sizing</span>
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] font-mono">
                SECTION 04
              </span>
            </div>

            {/* Sizing scale */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#404945] mb-2">
                Standard Apparel Sizing (Panjabi Chest Scale)
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {availableSizes.map((size) => {
                  const active = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 text-xs font-bold tracking-wider transition-colors border ${
                        active
                          ? 'bg-[#00231a] text-white border-[#00231a]'
                          : 'bg-white text-[#404945] border-[#deddd3] hover:border-[#073a2d]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="px-3 py-2 text-xs border border-dashed border-[#deddd3] text-[#717975] hover:border-[#073a2d] hover:text-[#073a2d]"
                >
                  + CUSTOM MEASURE
                </button>
              </div>
            </div>

            {/* Textile Shades */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#404945] mb-2">
                Selected Textile Shades
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                {selectedShades.map((shade) => (
                  <div
                    key={shade.name}
                    className="flex items-center gap-2 px-3 py-1.5 border border-[#deddd3] bg-[#fbf9f2] text-xs font-medium text-[#1b1c18]"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/20"
                      style={{ backgroundColor: shade.hex }}
                    />
                    <span>{shade.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedShades(selectedShades.filter((s) => s.name !== shade.name))
                      }
                      className="text-[#717975] hover:text-[#ba1a1a]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setSelectedShades([
                      ...selectedShades,
                      { name: 'Raw Silk White', hex: '#FBF9F2' },
                    ])
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#deddd3] bg-white text-xs text-[#717975] hover:border-[#073a2d]"
                >
                  <span className="w-3 h-3 rounded-full bg-[#fbf9f2] border border-[#deddd3]" />
                  <span>+ Raw Silk White</span>
                </button>
              </div>
            </div>

            {/* Combinations Matrix Table */}
            <div>
              <div className="flex items-center justify-between pb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#404945]">
                  GENERATED COMBINATIONS MATRIX
                </p>
                <span className="text-[11px] text-[#717975]">4 Active SKUs</span>
              </div>

              <div className="border border-[#deddd3] overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fbf9f2] text-[#717975] uppercase text-[10px] tracking-wider border-b border-[#deddd3]">
                    <tr>
                      <th className="p-3">VARIANT SPECIFICATION</th>
                      <th className="p-3">GENERATED SKU</th>
                      <th className="p-3">PRICE (BDT)</th>
                      <th className="p-3">IN-STOCK</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eee7]">
                    <tr>
                      <td className="p-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#073a2d]" />
                        <span>Olive Green x Size M (40)</span>
                      </td>
                      <td className="p-3 font-mono text-[#717975]">RL-PNJ-25-OG-M</td>
                      <td className="p-3 font-medium">৳3,450</td>
                      <td className="p-3">
                        <input
                          type="number"
                          defaultValue={12}
                          className="w-16 px-2 py-1 border border-[#deddd3] text-center font-mono"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <CheckCircle2 className="w-4 h-4 text-[#073a2d] inline-block" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#073a2d]" />
                        <span>Olive Green x Size L (42)</span>
                      </td>
                      <td className="p-3 font-mono text-[#717975]">RL-PNJ-25-OG-L</td>
                      <td className="p-3 font-medium">৳3,450</td>
                      <td className="p-3">
                        <input
                          type="number"
                          defaultValue={15}
                          className="w-16 px-2 py-1 border border-[#deddd3] text-center font-mono"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <CheckCircle2 className="w-4 h-4 text-[#073a2d] inline-block" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0f1a2c]" />
                        <span>Midnight Noir x Size M (40)</span>
                      </td>
                      <td className="p-3 font-mono text-[#717975]">RL-PNJ-25-BLK-M</td>
                      <td className="p-3 font-medium">৳3,450</td>
                      <td className="p-3">
                        <input
                          type="number"
                          defaultValue={8}
                          className="w-16 px-2 py-1 border border-[#deddd3] text-center font-mono"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <CheckCircle2 className="w-4 h-4 text-[#073a2d] inline-block" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#fbf9f2] border border-[#deddd3]" />
                        <span>Raw Silk White x Size L (42)</span>
                      </td>
                      <td className="p-3 font-mono text-[#717975]">RL-PNJ-25-WHT-L</td>
                      <td className="p-3 font-medium">৳3,450</td>
                      <td className="p-3">
                        <input
                          type="number"
                          defaultValue={7}
                          className="w-16 px-2 py-1 border border-[#deddd3] text-center font-mono"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <CheckCircle2 className="w-4 h-4 text-[#073a2d] inline-block" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Lookbook Media & Publishing */}
        <div className="lg:col-span-4 space-y-6">
          {/* Lookbook Media */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
              <h2 className="font-serif text-base font-medium text-[#1b1c18]">Lookbook Media</h2>
              <span className="text-[10px] font-bold text-[#073a2d] bg-[#bcedda]/40 px-2 py-0.5">
                3/4 LOADED
              </span>
            </div>
            <p className="text-[11px] text-[#717975]">
              Recommended 900 x 1400px portrait ratio on flat parchment or tonal studio ground.
            </p>

            {/* Dropzone */}
            <div className="border border-dashed border-[#deddd3] bg-[#fbf9f2] p-5 text-center cursor-pointer hover:border-[#073a2d] transition-colors">
              <Upload className="w-6 h-6 text-[#073a2d] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#1b1c18]">Upload Garment Angles</p>
              <p className="text-[10px] text-[#717975] mt-0.5">
                360° & high-res imagery here (PNG, JPG, WEBP up to 15MB)
              </p>
            </div>

            {/* Thumbnails grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="relative aspect-3/4 border border-[#deddd3] overflow-hidden group">
                <Image src={images[0]} alt="Featured" fill className="object-cover" unoptimized />
                <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-[#00231a] text-white px-1.5 py-0.5">
                  FEATURED
                </span>
              </div>
              <div className="relative aspect-3/4 border border-[#deddd3] overflow-hidden">
                <Image src={images[1]} alt="Angle 2" fill className="object-cover" unoptimized />
              </div>
              <div className="relative aspect-3/4 border border-[#deddd3] overflow-hidden">
                <Image src={images[2]} alt="Angle 3" fill className="object-cover" unoptimized />
              </div>
              <div className="relative aspect-3/4 border border-dashed border-[#deddd3] bg-[#fbf9f2] flex flex-col items-center justify-center text-center p-3 text-[#717975] hover:border-[#073a2d] cursor-pointer">
                <Plus className="w-4 h-4 text-[#073a2d] mb-1" />
                <span className="text-[10px] font-semibold uppercase">CUSTOM LOOKBOOK ANGLE</span>
              </div>
            </div>
          </div>

          {/* Publishing Status */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-4">
            <h2 className="font-serif text-base font-medium text-[#1b1c18] border-b border-[#f0eee7] pb-3">
              Publishing Status
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                Lifecycle State
              </label>
              <select
                value={lifecycleState}
                onChange={(e) => setLifecycleState(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
              >
                <option value="Active">Active • Live on Storefront</option>
                <option value="Draft">Draft • Hidden from Storefront</option>
                <option value="Archived">Archived • Private Atelier</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                Audience Visibility
              </label>
              <select className="w-full mt-1.5 px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden">
                <option>Public (All Store Visitors)</option>
                <option>VIP Patrons Only (Exclusive Preview)</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="mt-0.5 accent-[#073a2d]"
                />
                <span className="text-xs text-[#1b1c18]">
                  <strong className="block font-medium">Featured Master Piece</strong>
                  <span className="text-[11px] text-[#717975]">
                    Pin to homepage &apos;Featured Menswear&apos; curated editorial lookbook banner.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Metadata & Curation (Search Tags) */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
              <h2 className="font-serif text-base font-medium text-[#1b1c18]">Metadata & Curation</h2>
              <span className="text-[10px] text-[#717975] uppercase">Search Engine</span>
            </div>
            <p className="text-[11px] text-[#717975]">
              Categorical tags for filtering, seasonal campaign landing pages, and smart collections.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#f0eee7] border border-[#deddd3] text-[10px] font-bold text-[#404945] uppercase tracking-wider"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-[#ba1a1a]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <input
              type="text"
              placeholder="Type tag & press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              className="w-full px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden placeholder-[#717975]"
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-[#fbf9f2] border-t border-[#deddd3] px-8 py-3.5 flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center gap-2 text-xs text-[#717975]">
          <span className="w-2 h-2 rounded-full bg-[#c79a45]" />
          <span>Auto-saved draft at 10:42 • Atelier Admin Dhaka</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="px-4 py-2 border border-[#deddd3] bg-white text-xs font-semibold uppercase tracking-wider text-[#404945] hover:bg-[#f0eee7]"
          >
            DISCARD CHANGES
          </Link>
          <button
            onClick={() => handleSave(false)}
            className="px-4 py-2 border border-[#deddd3] bg-white text-xs font-semibold uppercase tracking-wider text-[#404945] hover:bg-[#f0eee7]"
          >
            SAVE AS DRAFT
          </button>
          <button
            onClick={() => handleSave(true)}
            className="flex items-center gap-1.5 px-6 py-2 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c79a45]" />
            <span>SAVE PRODUCT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
