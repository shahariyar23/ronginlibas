'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Loader2,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { AdminProduct } from '@/data/adminData';

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEditing = Boolean(editId);

  const { addProduct, updateProduct, getProductDetails, products } = useAdmin();

  // Loading state for edit mode
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Panjabi');
  const [fabricNote, setFabricNote] = useState('');
  const [description, setDescription] = useState('');

  // Pricing
  const [regularPrice, setRegularPrice] = useState('');
  const [promotionalPrice, setPromotionalPrice] = useState('');
  const [costOfGoods, setCostOfGoods] = useState('');

  // Inventory
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [aggregateStock, setAggregateStock] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('5');

  // Sizing selections
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const baseSizes = ['38"', '40"', '42"', '44"', 'XXL 46"'];

  // Shades
  const [selectedShades, setSelectedShades] = useState<{ name: string; hex: string }[]>([]);

  // Variants list from backend
  const [productVariants, setProductVariants] = useState<any[]>([]);

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Publishing
  const [lifecycleState, setLifecycleState] = useState('Active');
  const [isFeatured, setIsFeatured] = useState(false);

  // Images
  const [images, setImages] = useState<string[]>([]);

  // If in edit mode, fetch existing product details
  useEffect(() => {
    if (!editId) return;

    let isMounted = true;
    setIsLoadingProduct(true);

    const loadData = async () => {
      // 1. Initial fast pre-fill from context if present
      const cached = products.find((p) => p.id === editId || (p as any).slug === editId);
      if (cached && isMounted) {
        setTitle(cached.name || '');
        setCategory(cached.category || 'Panjabi');
        setFabricNote(cached.fabricNote || '');
        setDescription(cached.description || '');
        setRegularPrice(cached.price !== undefined ? cached.price.toString() : '');
        setPromotionalPrice(cached.promotionalPrice !== undefined ? cached.promotionalPrice.toString() : '');
        setCostOfGoods(cached.costOfGoods !== undefined ? cached.costOfGoods.toString() : '');
        setSku(cached.sku || '');
        setAggregateStock(cached.stock !== undefined ? cached.stock.toString() : '');
        setIsFeatured(cached.featured ?? false);
        setLifecycleState(cached.status === 'Active' ? 'Active' : 'Draft');
        if (cached.tags && cached.tags.length > 0) {
          setTags(cached.tags);
        }
        if (cached.image) {
          setImages([cached.image]);
        }
      }

      // 2. Fetch full specifications directly from backend API
      try {
        const detailed = await getProductDetails(editId);
        if (detailed && isMounted) {
          setTitle(detailed.name || '');
          setCategory(detailed.category?.name || 'Panjabi');
          setFabricNote(detailed.fabric || '');
          setDescription(detailed.description || '');
          setRegularPrice(detailed.price !== undefined ? detailed.price.toString() : '');
          setPromotionalPrice(
            detailed.compareAtPrice !== undefined && detailed.compareAtPrice !== null
              ? detailed.compareAtPrice.toString()
              : ''
          );
          setCostOfGoods(
            detailed.costPrice !== undefined && detailed.costPrice !== null
              ? detailed.costPrice.toString()
              : ''
          );
          setSku(detailed.sku || '');
          
          const totalStock = detailed.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) ?? 0;
          setAggregateStock(totalStock.toString());

          setIsFeatured(detailed.isFeatured ?? false);
          setLifecycleState(detailed.isActive ? 'Active' : 'Draft');
          
          if (detailed.tags && Array.isArray(detailed.tags)) {
            setTags(detailed.tags);
          }
          
          if (detailed.images && detailed.images.length > 0) {
            setImages(detailed.images.map((img: any) => (typeof img === 'string' ? img : img.url)));
          }

          if (detailed.variants && detailed.variants.length > 0) {
            setProductVariants(detailed.variants);
            const sizes = Array.from(new Set(detailed.variants.map((v: any) => v.size).filter(Boolean))) as string[];
            if (sizes.length > 0) setSelectedSizes(sizes);

            const shades = detailed.variants
              .filter((v: any) => v.color)
              .map((v: any) => ({ name: v.color, hex: '#00231A' }));
            if (shades.length > 0) {
              const uniqueShades = shades.filter((s, idx, arr) => arr.findIndex((x) => x.name === s.name) === idx);
              setSelectedShades(uniqueShades);
            }
          }
        }
      } catch (err) {
        console.warn('[EditProduct] Error fetching details:', err);
      } finally {
        if (isMounted) {
          setIsLoadingProduct(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [editId, getProductDetails, products]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        if (url) {
          setImages((prev) => [...prev, url]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

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

  const handleSave = async (publish: boolean = true) => {
    if (!title.trim()) {
      alert('Please specify garment silhouette title.');
      return;
    }
    const finalPrice = parseFloat(promotionalPrice) || parseFloat(regularPrice) || 0;
    const finalStock = parseInt(aggregateStock, 10) || 0;

    setIsSubmitting(true);
    try {
      if (isEditing && editId) {
        const updatedProduct: Partial<AdminProduct> = {
          name: title,
          sku: sku,
          category: category,
          price: finalPrice,
          promotionalPrice: promotionalPrice ? parseFloat(promotionalPrice) : undefined,
          costOfGoods: costOfGoods ? parseFloat(costOfGoods) : undefined,
          stock: finalStock,
          status: finalStock <= 5 && finalStock > 0 ? 'Low Stock' : finalStock === 0 ? 'Out of Stock' : 'Active',
          image: images[0] || undefined,
          fabricNote: fabricNote,
          description: description,
          tags: tags,
          featured: isFeatured,
        };

        await updateProduct(editId, updatedProduct);
        router.push('/products');
        return;
      }

      // Add mode
      const newProduct: AdminProduct = {
        id: `p-${Date.now()}`,
        name: title,
        sku: sku || `RL-${Date.now().toString().slice(-6)}`,
        category: category,
        price: finalPrice,
        promotionalPrice: promotionalPrice ? parseFloat(promotionalPrice) : undefined,
        costOfGoods: costOfGoods ? parseFloat(costOfGoods) : undefined,
        stock: finalStock,
        status: finalStock <= 5 && finalStock > 0 ? 'Low Stock' : finalStock === 0 ? 'Out of Stock' : 'Active',
        image:
          images[0] ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ',
        fabricNote: fabricNote,
        description: description,
        tags: tags,
        featured: isFeatured,
      };

      await addProduct(newProduct);
      router.push('/products');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine available sizes so existing product sizes always have a toggle
  const allAvailableSizes = Array.from(new Set([...baseSizes, ...selectedSizes]));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#717975] hover:text-[#073a2d] font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>
            {isEditing ? `Back to Products / EDIT SPECIFICATIONS` : 'Back to Products / CATALOGUE ENTRY'}
          </span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2 border-b border-[#deddd3] pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-serif text-[#1b1c18] tracking-tight">
                {isEditing ? (
                  <>
                    Edit Product:{' '}
                    <span className="text-[#073a2d]">{title || (isLoadingProduct ? 'Loading...' : 'Specification')}</span>
                  </>
                ) : (
                  'Add New Product'
                )}
              </h1>
              {isEditing && sku && (
                <span className="font-mono text-xs text-[#717975] bg-[#f0eee7] border border-[#deddd3] px-2.5 py-1">
                  SKU: {sku}
                </span>
              )}
            </div>
            <p className="text-xs text-[#69726d] mt-1">
              {isEditing
                ? `Update sartorial specifications, pricing structure, inventory and media for this atelier piece.`
                : 'Configure atelier specifications, sartorial details, and multi-tier variant inventory.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(false)}
              className="px-4 py-2.5 border border-[#deddd3] bg-white text-xs font-semibold uppercase tracking-wider text-[#404945] hover:bg-[#f0eee7] transition-colors cursor-pointer disabled:opacity-50"
            >
              SAVE AS DRAFT
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{isEditing ? 'UPDATE PRODUCT' : 'SAVE & PUBLISH'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading banner for edit mode */}
      {isLoadingProduct && (
        <div className="p-3 bg-[#f0eee7] border border-[#deddd3] flex items-center gap-2.5 text-xs text-[#073a2d]">
          <Loader2 className="w-4 h-4 animate-spin text-[#c79a45]" />
          <span>Synchronizing existing product specifications from database...</span>
        </div>
      )}

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
                  placeholder="Describe the textile weave, silhouette drape, and bespoke finishing..."
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
                    placeholder="3850"
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
                    placeholder="3450"
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
                    placeholder="1600"
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
                  placeholder="RL-PNJ-01"
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
                  placeholder="890123456789"
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
                  placeholder="25"
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
                {allAvailableSizes.map((size) => {
                  const active = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 text-xs font-bold tracking-wider transition-colors border cursor-pointer ${
                        active
                          ? 'bg-[#00231a] text-white border-[#00231a]'
                          : 'bg-white text-[#404945] border-[#deddd3] hover:border-[#073a2d]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Textile Shades */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#404945] mb-2">
                Selected Textile Shades
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                {selectedShades.map((shade, idx) => (
                  <div
                    key={`${shade.name}-${idx}`}
                    className="flex items-center gap-2 px-3 py-1.5 border border-[#deddd3] bg-[#fbf9f2] text-xs font-medium text-[#1b1c18]"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: shade.hex }}
                    />
                    <span>{shade.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedShades(selectedShades.filter((_, i) => i !== idx))
                      }
                      className="text-[#717975] hover:text-[#ba1a1a] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedShades.some((s) => s.name === 'Raw Silk White')) {
                      setSelectedShades([
                        ...selectedShades,
                        { name: 'Raw Silk White', hex: '#FBF9F2' },
                      ]);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#deddd3] bg-white text-xs text-[#717975] hover:border-[#073a2d] transition-colors cursor-pointer"
                >
                  <span className="w-3 h-3 rounded-full bg-[#fbf9f2] border border-[#deddd3]" />
                  <span>+ Raw Silk White</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedShades.some((s) => s.name === 'Royal Emerald')) {
                      setSelectedShades([
                        ...selectedShades,
                        { name: 'Royal Emerald', hex: '#00231A' },
                      ]);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#deddd3] bg-white text-xs text-[#717975] hover:border-[#073a2d] transition-colors cursor-pointer"
                >
                  <span className="w-3 h-3 rounded-full bg-[#00231a] border border-[#deddd3]" />
                  <span>+ Royal Emerald</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedShades.some((s) => s.name === 'Antique Gold')) {
                      setSelectedShades([
                        ...selectedShades,
                        { name: 'Antique Gold', hex: '#C79A45' },
                      ]);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#deddd3] bg-white text-xs text-[#717975] hover:border-[#073a2d] transition-colors cursor-pointer"
                >
                  <span className="w-3 h-3 rounded-full bg-[#c79a45] border border-[#deddd3]" />
                  <span>+ Antique Gold</span>
                </button>
              </div>
            </div>

            {/* Combinations Matrix Table */}
            <div>
              <div className="flex items-center justify-between pb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#404945]">
                  GENERATED COMBINATIONS MATRIX
                </p>
                <span className="text-[11px] text-[#717975] font-mono">
                  {productVariants.length > 0
                    ? `${productVariants.length} Active Atelier SKUs`
                    : `${selectedSizes.length > 0 ? selectedSizes.length : 1} Configured`}
                </span>
              </div>

              <div className="border border-[#deddd3] overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fbf9f2] text-[#717975] uppercase text-[10px] tracking-wider border-b border-[#deddd3]">
                    <tr>
                      <th className="p-3">VARIANT SPECIFICATION</th>
                      <th className="p-3">GENERATED SKU</th>
                      <th className="p-3">PRICE (BDT)</th>
                      <th className="p-3">IN-STOCK</th>
                      <th className="p-3 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eee7]">
                    {productVariants.length > 0 ? (
                      productVariants.map((v: any, idx: number) => (
                        <tr key={v.id || idx}>
                          <td className="p-3 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#073a2d]" />
                            <span className="font-medium text-[#1b1c18]">
                              {v.color || 'Standard'} x Size {v.size}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[#717975]">{v.sku || `${sku}-${v.size}`}</td>
                          <td className="p-3 font-medium">৳{(v.price || v.priceOverride || regularPrice || 0).toLocaleString()}</td>
                          <td className="p-3 font-mono font-semibold">{v.stock} pcs</td>
                          <td className="p-3 text-right">
                            <CheckCircle2 className="w-4 h-4 text-[#073a2d] inline-block" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-3 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#073a2d]" />
                          <span>Standard Atelier Cut x Size {selectedSizes[0] || '40"'}</span>
                        </td>
                        <td className="p-3 font-mono text-[#717975]">{sku || 'RL-NEW-STD'}</td>
                        <td className="p-3 font-medium">৳{(promotionalPrice || regularPrice || '0')}</td>
                        <td className="p-3 font-mono">{aggregateStock || '0'} pcs</td>
                        <td className="p-3 text-right">
                          <CheckCircle2 className="w-4 h-4 text-[#073a2d] inline-block" />
                        </td>
                      </tr>
                    )}
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
                {images.length}/4 LOADED
              </span>
            </div>
            <p className="text-[11px] text-[#717975]">
              Recommended 900 x 1400px portrait ratio on flat parchment or tonal studio ground.
            </p>

            {/* Dropzone */}
            <label className="border border-dashed border-[#deddd3] bg-[#fbf9f2] p-5 text-center cursor-pointer hover:border-[#073a2d] transition-colors block">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <Upload className="w-6 h-6 text-[#073a2d] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#1b1c18]">Upload Garment Angles</p>
              <p className="text-[10px] text-[#717975] mt-0.5">
                360° & high-res imagery here (PNG, JPG, WEBP up to 15MB)
              </p>
            </label>

            {/* Thumbnails grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Slot 1: Featured */}
              <div className="relative aspect-3/4 border border-[#deddd3] bg-[#fbf9f2] overflow-hidden group flex items-center justify-center">
                {images[0] ? (
                  <>
                    <Image src={images[0]} alt="Featured Angle" fill className="object-cover" unoptimized />
                    <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-[#00231a] text-white px-1.5 py-0.5 z-10">
                      FEATURED
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(0)}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white hover:bg-[#ba1a1a] opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center text-center p-3 text-[#717975] w-full h-full cursor-pointer hover:bg-[#f0eee7] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <ImageIcon className="w-5 h-5 text-[#8c9490] mb-1.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#073a2d]">Featured Angle</span>
                    <span className="text-[9px] text-[#8c9490] mt-0.5">Primary Display</span>
                  </label>
                )}
              </div>

              {/* Slot 2 */}
              <div className="relative aspect-3/4 border border-[#deddd3] bg-[#fbf9f2] overflow-hidden group flex items-center justify-center">
                {images[1] ? (
                  <>
                    <Image src={images[1]} alt="Angle 2" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => removeImage(1)}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white hover:bg-[#ba1a1a] opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center text-center p-3 text-[#717975] w-full h-full cursor-pointer hover:bg-[#f0eee7] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <ImageIcon className="w-5 h-5 text-[#8c9490] mb-1.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#404945]">Side / Back</span>
                    <span className="text-[9px] text-[#8c9490] mt-0.5">Secondary Angle</span>
                  </label>
                )}
              </div>

              {/* Slot 3 */}
              <div className="relative aspect-3/4 border border-[#deddd3] bg-[#fbf9f2] overflow-hidden group flex items-center justify-center">
                {images[2] ? (
                  <>
                    <Image src={images[2]} alt="Angle 3" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => removeImage(2)}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white hover:bg-[#ba1a1a] opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center text-center p-3 text-[#717975] w-full h-full cursor-pointer hover:bg-[#f0eee7] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <ImageIcon className="w-5 h-5 text-[#8c9490] mb-1.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#404945]">Detail / Texture</span>
                    <span className="text-[9px] text-[#8c9490] mt-0.5">Fabric Close-up</span>
                  </label>
                )}
              </div>

              {/* Slot 4 / Extra */}
              <div className="relative aspect-3/4 border border-[#deddd3] bg-[#fbf9f2] overflow-hidden group flex items-center justify-center">
                {images[3] ? (
                  <>
                    <Image src={images[3]} alt="Angle 4" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => removeImage(3)}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white hover:bg-[#ba1a1a] opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <label className="relative w-full h-full border border-dashed border-[#deddd3] bg-[#fbf9f2] flex flex-col items-center justify-center text-center p-3 text-[#717975] hover:border-[#073a2d] cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Plus className="w-4 h-4 text-[#073a2d] mb-1" />
                    <span className="text-[10px] font-semibold uppercase">CUSTOM ANGLE</span>
                  </label>
                )}
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
                    className="hover:text-[#ba1a1a] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
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
          <span>
            {isEditing
              ? `Editing Atelier Consignment: ${sku || title || editId}`
              : 'Auto-saved draft • Atelier Admin Dhaka'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="px-4 py-2 border border-[#deddd3] bg-white text-xs font-semibold uppercase tracking-wider text-[#404945] hover:bg-[#f0eee7]"
          >
            DISCARD CHANGES
          </Link>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(false)}
            className="px-4 py-2 border border-[#deddd3] bg-white text-xs font-semibold uppercase tracking-wider text-[#404945] hover:bg-[#f0eee7] cursor-pointer disabled:opacity-50"
          >
            SAVE AS DRAFT
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(true)}
            className="flex items-center gap-1.5 px-6 py-2 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#c79a45]" />
            )}
            <span>{isEditing ? 'UPDATE PRODUCT' : 'SAVE PRODUCT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-[#717975] flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#073a2d]" />
          <span>Loading Atelier Catalogue specifications...</span>
        </div>
      }
    >
      <ProductFormContent />
    </Suspense>
  );
}
