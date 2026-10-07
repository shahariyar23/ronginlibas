'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
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
  Trash2,
  Palette,
  Layers,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { AdminProduct } from '@/data/adminData';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = (params?.id as string) || '';

  const { updateProduct, getProductDetails, products } = useAdmin();

  const [isLoading, setIsLoading] = useState(true);
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
  const [aggregateStock, setAggregateStock] = useState('0');
  const [alertThreshold, setAlertThreshold] = useState('5');

  // Sizing selections
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const baseSizes = ['38"', '40"', '42"', '44"', 'XXL 46"', 'S', 'M', 'L', 'XL', 'XXL'];
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [showCustomSize, setShowCustomSize] = useState(false);

  // Shades
  const [selectedShades, setSelectedShades] = useState<{ name: string; hex: string }[]>([]);
  const [newShadeName, setNewShadeName] = useState('');
  const [newShadeHex, setNewShadeHex] = useState('#00231A');
  const [showAddShade, setShowAddShade] = useState(false);

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

  // Load product details on mount
  useEffect(() => {
    if (!productId) return;

    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      // 1. Context fallback prefill
      const cached = products.find((p) => p.id === productId || (p as any).slug === productId);
      if (cached && isMounted) {
        setTitle(cached.name || '');
        setCategory(cached.category || 'Panjabi');
        setFabricNote(cached.fabricNote || '');
        setDescription(cached.description || '');
        setRegularPrice(cached.price !== undefined ? cached.price.toString() : '');
        setPromotionalPrice(cached.promotionalPrice !== undefined ? cached.promotionalPrice.toString() : '');
        setCostOfGoods(cached.costOfGoods !== undefined ? cached.costOfGoods.toString() : '');
        setSku(cached.sku || '');
        setAggregateStock(cached.stock !== undefined ? cached.stock.toString() : '0');
        setIsFeatured(cached.featured ?? false);
        setLifecycleState(cached.status === 'Active' ? 'Active' : 'Draft');
        if (cached.tags?.length) setTags(cached.tags);
        if (cached.image) setImages([cached.image]);
      }

      // 2. Fetch authoritative data from database API
      try {
        const detailed = await getProductDetails(productId);
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
        console.warn('[EditProduct] Error fetching product specifications:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [productId, getProductDetails, products]);

  // Variant helper functions
  const updateVariant = (index: number, field: string, value: any) => {
    setProductVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'stock') {
        const total = updated.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
        setAggregateStock(total.toString());
      }
      return updated;
    });
  };

  const removeVariant = (index: number) => {
    setProductVariants((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      const total = updated.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
      setAggregateStock(total.toString());
      return updated;
    });
  };

  const addVariantRow = (sizeParam?: string, colorParam?: string) => {
    const chosenSize = sizeParam || (allAvailableSizes.find((s) => !productVariants.some((v) => v.size === s)) || '40"');
    const chosenColor = colorParam || (selectedShades[0]?.name || 'Standard');
    const cleanSize = chosenSize.replace(/"/g, '').replace(/\s+/g, '');
    const cleanColor = chosenColor.split(' ')[0].toUpperCase();
    const generatedSku = `${sku || 'RL'}-${cleanColor.slice(0, 3)}-${cleanSize}`;

    const newVariant = {
      id: `v-temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      size: chosenSize,
      color: chosenColor,
      sku: generatedSku,
      price: regularPrice ? parseFloat(regularPrice) : 0,
      priceOverride: promotionalPrice ? parseFloat(promotionalPrice) : (regularPrice ? parseFloat(regularPrice) : 0),
      stock: 10,
      isActive: true,
    };

    setProductVariants((prev) => {
      const updated = [...prev, newVariant];
      const total = updated.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
      setAggregateStock(total.toString());
      return updated;
    });

    if (!selectedSizes.includes(chosenSize)) {
      setSelectedSizes((prev) => [...prev, chosenSize]);
    }
  };

  const toggleSize = (size: string) => {
    const exists = productVariants.some((v) => v.size === size);
    if (exists) {
      setProductVariants((prev) => {
        const updated = prev.filter((v) => v.size !== size);
        const total = updated.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
        setAggregateStock(total.toString());
        return updated;
      });
      setSelectedSizes((prev) => prev.filter((s) => s !== size));
    } else {
      setSelectedSizes((prev) => [...prev, size]);
      addVariantRow(size);
    }
  };

  const handleAddCustomSize = () => {
    if (!customSizeInput.trim()) return;
    const size = customSizeInput.trim();
    if (!selectedSizes.includes(size)) {
      setSelectedSizes((prev) => [...prev, size]);
      addVariantRow(size);
    }
    setCustomSizeInput('');
    setShowCustomSize(false);
  };

  const handleAddShade = () => {
    if (!newShadeName.trim()) return;
    const name = newShadeName.trim();
    if (!selectedShades.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setSelectedShades((prev) => [...prev, { name, hex: newShadeHex }]);
    }
    setNewShadeName('');
    setShowAddShade(false);
  };

  const removeShade = (shadeName: string) => {
    setSelectedShades((prev) => prev.filter((s) => s.name !== shadeName));
  };

  const generateCombinationsMatrix = () => {
    const activeSizes = selectedSizes.length > 0 ? selectedSizes : ['38"', '40"', '42"', '44"'];
    const activeShades = selectedShades.length > 0 ? selectedShades : [{ name: 'Standard', hex: '#00231A' }];
    const basePrice = regularPrice ? parseFloat(regularPrice) : 0;

    const combinations: any[] = [];
    activeShades.forEach((shade) => {
      activeSizes.forEach((size) => {
        const cleanSize = size.replace(/"/g, '').replace(/\s+/g, '');
        const cleanColor = shade.name.split(' ')[0].toUpperCase();
        combinations.push({
          id: `v-gen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          size,
          color: shade.name,
          sku: `${sku || 'RL'}-${cleanColor.slice(0, 3)}-${cleanSize}`,
          price: basePrice,
          priceOverride: promotionalPrice ? parseFloat(promotionalPrice) : basePrice,
          stock: 10,
          isActive: true,
        });
      });
    });

    setProductVariants(combinations);
    const total = combinations.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
    setAggregateStock(total.toString());
  };

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
        variants: productVariants.map((v) => ({
          id: v.id?.startsWith('v-') ? undefined : v.id,
          size: v.size,
          color: v.color || 'Standard',
          sku: v.sku || `${sku}-${v.size}`,
          stock: parseInt(v.stock, 10) || 0,
          priceOverride:
            v.priceOverride !== undefined && v.priceOverride !== ''
              ? parseFloat(v.priceOverride)
              : v.price !== undefined
              ? parseFloat(v.price)
              : finalPrice,
          price: v.price ? parseFloat(v.price) : finalPrice,
          isActive: v.isActive !== false,
        })),
      };

      await updateProduct(productId, updatedProduct);
      router.push('/products');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allAvailableSizes = Array.from(new Set([...baseSizes, ...selectedSizes]));

  if (isLoading && !title) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#073a2d]" />
        <p className="font-serif text-lg text-[#1b1c18]">
          Retrieving Atelier Product Specifications...
        </p>
        <p className="text-xs text-[#717975] font-mono">Product ID: {productId}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-24">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#717975] hover:text-[#073a2d] font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products / EDIT SPECIFICATIONS</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2 border-b border-[#deddd3] pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-serif text-[#1b1c18] tracking-tight">
                Edit Product: <span className="text-[#073a2d]">{title || 'Garment'}</span>
              </h1>
              {sku && (
                <span className="font-mono text-xs text-[#717975] bg-[#f0eee7] border border-[#deddd3] px-2.5 py-1">
                  SKU: {sku}
                </span>
              )}
            </div>
            <p className="text-xs text-[#69726d] mt-1">
              Modify atelier sartorial specifications, pricing matrix, and active inventory in PostgreSQL database.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="px-4 py-2.5 border border-[#deddd3] bg-white text-xs font-semibold uppercase tracking-wider text-[#404945] hover:bg-[#f0eee7] transition-colors"
            >
              CANCEL
            </Link>
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
              <span>UPDATE PRODUCT</span>
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
                placeholder="Product Title"
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
                  className="w-full mt-1.5 px-3 py-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden cursor-pointer"
                >
                  <option value="Panjabi">Panjabi (Bespoke & RTW)</option>
                  <option value="Shirts">Shirts (Formal & Atelier)</option>
                  <option value="Polos">Polos (Mercerized Knit)</option>
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
                  placeholder="Fabric composition & weave"
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
                  placeholder="Barcode"
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
                <span className="text-[10px] text-[#717975] mt-0.5 block">
                  Sum of active variants stock
                </span>
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
              <div>
                <h2 className="font-serif text-lg font-medium text-[#1b1c18] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c79a45]" />
                  <span>Variants Matrix & Atelier Sizing</span>
                </h2>
                <p className="text-[11px] text-[#717975] mt-0.5">
                  Configure sizes, colors, custom SKUs, price overrides, and stock levels.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] font-mono">
                SECTION 04
              </span>
            </div>

            {/* Sizing scale */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#404945]">
                  Standard Apparel Sizing (Click to toggle/add variant)
                </p>
                <button
                  type="button"
                  onClick={() => setShowCustomSize(!showCustomSize)}
                  className="text-xs text-[#073a2d] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Custom Size</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {allAvailableSizes.map((size) => {
                  const active = productVariants.some((v) => v.size === size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      title={active ? 'Click to remove this size variant' : 'Click to add variant for this size'}
                      className={`px-3.5 py-1.5 text-xs font-bold tracking-wider transition-colors border cursor-pointer ${
                        active
                          ? 'bg-[#00231a] text-white border-[#00231a] shadow-xs'
                          : 'bg-white text-[#404945] border-[#deddd3] hover:border-[#073a2d]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {/* Inline Custom Size Adder */}
              {showCustomSize && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    placeholder="Enter custom size (e.g. 36, 48, Bespoke)"
                    className="px-3 py-1.5 text-xs bg-[#fbf9f2] border border-[#deddd3] text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="px-3 py-1.5 bg-[#00231a] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Add Size
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomSize(false)}
                    className="px-2 py-1.5 border border-[#deddd3] text-xs text-[#717975] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Textile Shades */}
            <div className="space-y-2 border-t border-[#f0eee7] pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#404945] flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#073a2d]" />
                  <span>Textile Shades / Colors</span>
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddShade(!showAddShade)}
                  className="text-xs text-[#073a2d] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Shade</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedShades.map((shade, idx) => (
                  <div
                    key={`${shade.name}-${idx}`}
                    className="flex items-center gap-2 px-3 py-1.5 border border-[#deddd3] bg-[#fbf9f2] text-xs font-medium text-[#1b1c18]"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: shade.hex }}
                    />
                    <span>{shade.name}</span>
                    <button
                      type="button"
                      onClick={() => removeShade(shade.name)}
                      className="text-[#717975] hover:text-[#ba1a1a] cursor-pointer ml-1"
                      title="Remove shade"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Preset quick buttons */}
                {['Navy Atelier', 'Raw Silk White', 'Royal Emerald', 'Midnight Noir'].map((preset) => {
                  if (selectedShades.some((s) => s.name === preset)) return null;
                  const hexMap: Record<string, string> = {
                    'Navy Atelier': '#0F1A2C',
                    'Raw Silk White': '#FBF9F2',
                    'Royal Emerald': '#00231A',
                    'Midnight Noir': '#1A1A1A',
                  };
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setSelectedShades((prev) => [...prev, { name: preset, hex: hexMap[preset] }]);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 border border-[#deddd3] bg-white text-xs text-[#717975] hover:border-[#073a2d] hover:text-[#073a2d] transition-colors cursor-pointer"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: hexMap[preset] }}
                      />
                      <span>+ {preset}</span>
                    </button>
                  );
                })}
              </div>

              {/* Inline Custom Shade Adder */}
              {showAddShade && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="color"
                    value={newShadeHex}
                    onChange={(e) => setNewShadeHex(e.target.value)}
                    className="w-8 h-8 p-0.5 border border-[#deddd3] rounded-xs cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newShadeName}
                    onChange={(e) => setNewShadeName(e.target.value)}
                    placeholder="Shade Name (e.g. Vintage Beige)"
                    className="px-3 py-1.5 text-xs bg-[#fbf9f2] border border-[#deddd3] text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddShade}
                    className="px-3 py-1.5 bg-[#00231a] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Add Shade
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddShade(false)}
                    className="px-2 py-1.5 border border-[#deddd3] text-xs text-[#717975] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Editable Variants Table */}
            <div className="space-y-3 border-t border-[#f0eee7] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#404945] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#073a2d]" />
                    <span>Active Atelier Variants ({productVariants.length} Variants)</span>
                  </p>
                  <span className="text-[11px] text-[#717975]">
                    Directly modify SKU, price overrides, and stock levels below.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={generateCombinationsMatrix}
                    className="px-3 py-1.5 border border-[#deddd3] bg-white hover:bg-[#f0eee7] text-[11px] font-semibold text-[#404945] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Generate Matrix
                  </button>
                  <button
                    type="button"
                    onClick={() => addVariantRow()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Variant</span>
                  </button>
                </div>
              </div>

              <div className="border border-[#deddd3] overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#fbf9f2] text-[#717975] uppercase text-[10px] tracking-wider border-b border-[#deddd3]">
                    <tr>
                      <th className="p-3 w-36">COLOR / SHADE</th>
                      <th className="p-3 w-28">SIZE</th>
                      <th className="p-3">VARIANT SKU</th>
                      <th className="p-3 w-36">PRICE (BDT ৳)</th>
                      <th className="p-3 w-28">STOCK</th>
                      <th className="p-3 text-right w-16">REMOVE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eee7]">
                    {productVariants.length > 0 ? (
                      productVariants.map((v: any, idx: number) => (
                        <tr key={v.id || idx} className="hover:bg-[#fdfcf9] transition-colors">
                          {/* Color */}
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={v.color || 'Standard'}
                              onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                              className="w-full px-2 py-1.5 bg-[#fbf9f2] border border-[#deddd3] text-xs font-medium text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                            />
                          </td>

                          {/* Size */}
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={v.size || ''}
                              onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                              className="w-full px-2 py-1.5 bg-[#fbf9f2] border border-[#deddd3] text-xs font-bold text-[#1b1c18] text-center focus:border-[#073a2d] outline-hidden"
                            />
                          </td>

                          {/* SKU */}
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={v.sku || ''}
                              onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                              className="w-full px-2 py-1.5 bg-[#fbf9f2] border border-[#deddd3] text-xs font-mono font-semibold text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                            />
                          </td>

                          {/* Price */}
                          <td className="p-2.5">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#717975]">
                                ৳
                              </span>
                              <input
                                type="number"
                                value={v.priceOverride !== undefined && v.priceOverride !== null ? v.priceOverride : (v.price || regularPrice || '')}
                                onChange={(e) => updateVariant(idx, 'priceOverride', e.target.value)}
                                className="w-full pl-6 pr-2 py-1.5 bg-[#fbf9f2] border border-[#deddd3] text-xs font-semibold text-[#1b1c18] font-mono focus:border-[#073a2d] outline-hidden"
                              />
                            </div>
                          </td>

                          {/* Stock */}
                          <td className="p-2.5">
                            <input
                              type="number"
                              min="0"
                              value={v.stock !== undefined ? v.stock : 0}
                              onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                              className="w-full px-2 py-1.5 bg-[#fbf9f2] border border-[#deddd3] text-xs font-mono font-bold text-center text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                            />
                          </td>

                          {/* Actions */}
                          <td className="p-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => removeVariant(idx)}
                              className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xs transition-colors cursor-pointer"
                              title="Delete variant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-xs text-[#717975]">
                          No variants configured. Click <strong>+ Add Variant</strong> or <strong>Generate Matrix</strong> to create apparel combinations.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer with Add Variant and Summary */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => addVariantRow()}
                  className="flex items-center gap-1.5 text-xs text-[#073a2d] font-bold uppercase tracking-wider hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Variant Row</span>
                </button>

                <span className="font-mono text-[#717975] text-[11px]">
                  Total Calculated Stock: <strong>{aggregateStock} pcs</strong>
                </span>
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
                360° & high-res imagery here (PNG, JPG, WEBP)
              </p>
            </label>

            {/* Thumbnails grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[0, 1, 2, 3].map((slotIdx) => {
                const img = images[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    className="relative aspect-3/4 border border-[#deddd3] bg-[#fbf9f2] overflow-hidden group flex items-center justify-center"
                  >
                    {img ? (
                      <>
                        <Image src={img} alt={`Angle ${slotIdx + 1}`} fill className="object-cover" unoptimized />
                        {slotIdx === 0 && (
                          <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-[#00231a] text-white px-1.5 py-0.5 z-10">
                            FEATURED
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(slotIdx)}
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
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#404945]">
                          {slotIdx === 0 ? 'Primary' : `Angle ${slotIdx + 1}`}
                        </span>
                      </label>
                    )}
                  </div>
                );
              })}
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
                className="w-full mt-1.5 px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden cursor-pointer"
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
          <span>Editing Atelier Consignment: {sku || title || productId}</span>
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
            onClick={() => handleSave(true)}
            className="flex items-center gap-1.5 px-6 py-2 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#c79a45]" />
            )}
            <span>UPDATE PRODUCT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
