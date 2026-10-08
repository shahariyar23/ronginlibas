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
  Trash2,
  Palette,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { AdminProduct, AdminProductDetail } from '@/data/adminData';
import { ProductFormSkeleton } from '@/components/common/Skeleton';
import {
  cleanupUploadedProductImages,
  ProductImageDraft,
  uploadPendingProductImages,
} from '@/lib/product-images';
import {
  normalizeSizeLabel,
  STANDARD_APPAREL_SIZES,
  TROUSER_WAIST_SIZES,
  getConfiguredSizeType,
  isProductSizeType,
  ProductSizeType,
} from '@/lib/product-size';

function generateCategorySku(catName: string): string {
  const clean = (catName || 'Panjabi').trim();
  let prefix = 'PAN';
  const words = clean.split(/\s+/);
  if (words.length > 1) {
    prefix = words.map((w) => w[0]?.toUpperCase() || '').join('').slice(0, 4);
  } else {
    const stripped = clean.replace(/[^A-Za-z]/g, '').toUpperCase();
    prefix = stripped.slice(0, 3) || 'RL';
  }
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `RL-${prefix}-${randNum}`;
}

function generateBarcode(): string {
  const timePart = Date.now().toString().slice(-6);
  const randPart = Math.floor(100 + Math.random() * 900).toString();
  return `890${timePart}${randPart}`;
}

function ProductFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isEditing = Boolean(editId);

  const { addProduct, updateProduct, getProductDetails, products, categories } = useAdmin();

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
  const [sku, setSku] = useState(() => generateCategorySku('Panjabi'));
  const [barcode, setBarcode] = useState(() => generateBarcode());
  const [isSkuManuallyEdited, setIsSkuManuallyEdited] = useState(false);
  const [aggregateStock, setAggregateStock] = useState('25');
  const [alertThreshold, setAlertThreshold] = useState('5');

  // Sizing selections
  const baseSizes = STANDARD_APPAREL_SIZES;
  const [customSizes, setCustomSizes] = useState<string[]>([]);
  const [customSizeTypes, setCustomSizeTypes] = useState<Record<string, ProductSizeType>>({});
  const [customSizeType, setCustomSizeType] = useState<ProductSizeType>('CUSTOM');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [showCustomSize, setShowCustomSize] = useState(false);

  // Shades
  const [selectedShades, setSelectedShades] = useState<{ name: string; hex: string }[]>([
    { name: 'Royal Emerald', hex: '#00231A' },
  ]);
  const [newShadeName, setNewShadeName] = useState('');
  const [newShadeHex, setNewShadeHex] = useState('#00231A');
  const [showAddShade, setShowAddShade] = useState(false);

  // Variants list
  const [productVariants, setProductVariants] = useState<any[]>([]);

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Publishing
  const [lifecycleState, setLifecycleState] = useState('Active');
  const [isFeatured, setIsFeatured] = useState(false);

  // Images
  const [images, setImages] = useState<ProductImageDraft[]>([]);

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
        if (cached.alertThreshold !== undefined && cached.alertThreshold !== null) {
          setAlertThreshold(cached.alertThreshold.toString());
        }
        setIsFeatured(cached.featured ?? false);
        setLifecycleState(cached.status === 'Active' ? 'Active' : 'Draft');
        if (cached.tags && cached.tags.length > 0) {
          setTags(cached.tags);
        }
        setImages(cached.images ?? []);
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
          if (detailed.alertThreshold !== undefined && detailed.alertThreshold !== null) {
            setAlertThreshold(detailed.alertThreshold.toString());
          }

          setIsFeatured(detailed.isFeatured ?? false);
          setLifecycleState(detailed.isActive ? 'Active' : 'Draft');
          
          if (detailed.tags && Array.isArray(detailed.tags)) {
            setTags(detailed.tags);
          }
          
          setImages((detailed.images ?? []).map((img: any) =>
            typeof img === 'string' ? { url: img } : {
              url: img.url,
              publicId: img.publicId ?? undefined,
              altText: img.altText ?? undefined,
              sortOrder: img.sortOrder,
              isPrimary: img.isPrimary,
            },
          ));

          if (detailed.variants && detailed.variants.length > 0) {
            const variants = detailed.variants.map((variant: AdminProductDetail['variants'][number]) => {
              const measurements =
                variant.measurements && typeof variant.measurements === 'object'
                  ? variant.measurements as Record<string, unknown>
                  : {};
              const firstMeasurement = Object.entries(measurements).find(
                ([key, value]) => key !== 'unit' && typeof value === 'number',
              );
              return {
                ...variant,
                measurementDimension: firstMeasurement?.[0] || '',
                measurementValue: firstMeasurement?.[1]?.toString() || '',
                measurementUnit: measurements.unit === 'CM' ? 'CM' : 'IN',
              };
            });
            setProductVariants(variants);
            const sizes = Array.from(new Set(variants.map((v) => normalizeSizeLabel(v.sizeLabel || v.size)).filter(Boolean)));
            if (sizes.length > 0) setSelectedSizes(sizes);
            const configuredTypes: Record<string, ProductSizeType> = {};
            for (const variant of variants) {
              if (isProductSizeType(variant.sizeType)) {
                configuredTypes[normalizeSizeLabel(variant.sizeLabel || variant.size)] =
                  variant.sizeType;
              }
            }
            setCustomSizeTypes(configuredTypes);

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

    const selectedFiles = Array.from(files);
    e.currentTarget.value = '';
    if (images.length + selectedFiles.length > 4) {
      window.alert('A product can have up to four images.');
      return;
    }
    if (selectedFiles.some((file) =>
      !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) ||
      file.size > 15 * 1024 * 1024,
    )) {
      window.alert('Choose JPEG, PNG, WEBP, or AVIF images smaller than 15 MB.');
      return;
    }
    setImages((prev) => [
      ...prev,
      ...selectedFiles.map((file) => ({ url: URL.createObjectURL(file), file })),
    ]);
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => {
      const image = prev[indexToRemove];
      if (image?.file) URL.revokeObjectURL(image.url);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  // Gross margin calculation
  const regNum = parseFloat(promotionalPrice || regularPrice) || 0;
  const costNum = parseFloat(costOfGoods) || 0;
  const grossMargin = regNum > 0 ? (((regNum - costNum) / regNum) * 100).toFixed(1) : '0.0';

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (!isSkuManuallyEdited) {
      setSku(generateCategorySku(newCat));
    }
  };

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      const nextType = getConfiguredSizeType(size, productVariants, customSizeTypes, category);
      const selectedTypes = selectedSizes
        .map((selected) =>
          getConfiguredSizeType(selected, productVariants, customSizeTypes, category),
        )
        .filter((type): type is ProductSizeType => Boolean(type));
      if (nextType && selectedTypes.some((type) => type !== nextType)) {
        window.alert('Use one sizing system per product matrix. Remove the selected sizes before switching systems.');
        return;
      }
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleAddCustomSize = () => {
    const trimmed = normalizeSizeLabel(customSizeInput);
    if (!trimmed) return;
    const newType = STANDARD_APPAREL_SIZES.includes(trimmed) ? 'APPAREL' : customSizeType;
    const selectedTypes = selectedSizes
      .map((selected) =>
        getConfiguredSizeType(selected, productVariants, customSizeTypes, category),
      )
      .filter((type): type is ProductSizeType => Boolean(type));
    if (selectedTypes.some((type) => type !== newType)) {
      window.alert('Use one sizing system per product matrix. Remove the selected sizes before switching systems.');
      return;
    }
    if (!allAvailableSizes.includes(trimmed)) {
      setCustomSizes((prev) => [...prev, trimmed]);
    }
    setCustomSizeTypes((prev) => ({ ...prev, [trimmed]: newType }));
    if (!selectedSizes.includes(trimmed)) {
      setSelectedSizes((prev) => [...prev, trimmed]);
    }
    setCustomSizeInput('');
    setShowCustomSize(false);
  };

  const removeCustomSize = (sizeToRemove: string) => {
    setCustomSizes((prev) => prev.filter((s) => s !== sizeToRemove));
    setSelectedSizes((prev) => prev.filter((s) => s !== sizeToRemove));
  };

  const handleAddShade = () => {
    const trimmed = newShadeName.trim();
    if (!trimmed) return;
    if (!selectedShades.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedShades((prev) => [...prev, { name: trimmed, hex: newShadeHex }]);
    }
    setNewShadeName('');
    setShowAddShade(false);
  };

  const removeShade = (nameToRemove: string) => {
    setSelectedShades((prev) => prev.filter((s) => s.name !== nameToRemove));
  };

  const generateCombinationsMatrix = () => {
    const sizesToUse = selectedSizes.length > 0 ? selectedSizes : ['Standard'];
    const shadesToUse = selectedShades.length > 0 ? selectedShades : [{ name: 'Standard', hex: '#00231A' }];
    const defaultPrice = promotionalPrice ? parseFloat(promotionalPrice) : (regularPrice ? parseFloat(regularPrice) : undefined);
    const defaultStock = parseInt(aggregateStock, 10) || 10;

    const combinations: any[] = [];
    for (const s of sizesToUse) {
      for (const shade of shadesToUse) {
        const normalizedSize = normalizeSizeLabel(s);
        const existingVariant = productVariants.find(
          (variant) =>
            normalizeSizeLabel(variant.sizeLabel || variant.size) === normalizedSize &&
            variant.color === shade.name,
        );
        const sizeType = getConfiguredSizeType(
          normalizedSize,
          productVariants,
          customSizeTypes,
          category,
        );
        const cleanSize = normalizedSize.replace(/[^A-Za-z0-9]/g, '');
        const cleanShade = shade.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
        combinations.push({
          id: existingVariant?.id ?? `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          size: existingVariant?.size ?? normalizedSize,
          sizeLabel:
            existingVariant?.sizeLabel ??
            (sizeType || STANDARD_APPAREL_SIZES.includes(normalizedSize)
              ? normalizedSize
              : undefined),
          sizeType,
          color: shade.name,
          sku: existingVariant?.sku ?? `${sku || 'RL'}-${cleanShade || 'DEF'}-${cleanSize || 'STD'}`,
          price: existingVariant?.price ?? defaultPrice,
          priceOverride: existingVariant?.priceOverride ?? existingVariant?.price ?? defaultPrice,
          stock: existingVariant?.stock ?? defaultStock,
          isActive: true,
        });
      }
    }
    setProductVariants(combinations);
  };

  const addVariantRow = () => {
    const defaultSize = normalizeSizeLabel(selectedSizes[0] || 'M');
    const defaultColor = selectedShades[0]?.name || 'Standard';
    const defaultPrice = promotionalPrice ? parseFloat(promotionalPrice) : (regularPrice ? parseFloat(regularPrice) : undefined);
    const sizeType = getConfiguredSizeType(defaultSize, productVariants, customSizeTypes, category);
    const newVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      size: defaultSize,
      sizeLabel:
        sizeType || STANDARD_APPAREL_SIZES.includes(defaultSize) ? defaultSize : undefined,
      sizeType,
      color: defaultColor,
      sku: `${sku || 'RL'}-${defaultColor.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase()}-${defaultSize.replace(/[^A-Za-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`,
      price: defaultPrice,
      priceOverride: defaultPrice,
      stock: 10,
      isActive: true,
    };
    setProductVariants((prev) => [...prev, newVariant]);
  };

  const removeVariant = (index: number) => {
    setProductVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setProductVariants((prev) => {
      const next = [...prev];
      const variant = next[index];
      if (field === 'size') {
        const sizeLabel = normalizeSizeLabel(String(value));
        next[index] = { ...variant, size: sizeLabel, sizeLabel };
      } else if (
        field === 'measurementDimension' ||
        field === 'measurementValue' ||
        field === 'measurementUnit'
      ) {
        const dimension =
          field === 'measurementDimension' ? String(value).trim() : variant.measurementDimension;
        const measurementValue =
          field === 'measurementValue' ? String(value) : variant.measurementValue;
        const measurementUnit =
          field === 'measurementUnit' ? String(value) : variant.measurementUnit || 'IN';
        const measurements =
          variant.measurements && typeof variant.measurements === 'object'
            ? { ...variant.measurements }
            : {};
        if (dimension && measurementValue !== '') {
          measurements[dimension.toLowerCase()] = Number(measurementValue);
          measurements.unit = measurementUnit;
        } else if (dimension) {
          delete measurements[dimension.toLowerCase()];
        }
        next[index] = {
          ...variant,
          [field]: value,
          measurements: Object.keys(measurements).some((key) => key !== 'unit')
            ? measurements
            : undefined,
        };
      } else {
        next[index] = { ...variant, [field]: value };
      }
      return next;
    });
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
    const finalStock =
      productVariants.length > 0
        ? productVariants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
        : parseInt(aggregateStock, 10) || 0;
    const parsedThreshold = parseInt(alertThreshold, 10);
    const validAlertThreshold = !Number.isNaN(parsedThreshold) ? parsedThreshold : 5;

    setIsSubmitting(true);
    try {
      const uploadedImages = await uploadPendingProductImages(images);
      if (isEditing && editId) {
        const updatedProduct: Partial<AdminProduct> = {
          name: title,
          sku: sku,
          barcode: barcode || undefined,
          category: category,
          price: finalPrice,
          promotionalPrice: promotionalPrice ? parseFloat(promotionalPrice) : undefined,
          costOfGoods: costOfGoods ? parseFloat(costOfGoods) : undefined,
          stock: finalStock,
          alertThreshold: validAlertThreshold,
          status:
            finalStock <= validAlertThreshold && finalStock > 0
              ? 'Low Stock'
              : finalStock === 0
              ? 'Out of Stock'
              : 'Active',
          image: uploadedImages.images[0]?.url,
          images: uploadedImages.images,
          fabricNote: fabricNote,
          description: description,
          tags: tags,
          featured: isFeatured,
          variants: productVariants.length > 0 ? productVariants : undefined,
        };

        const saved = await updateProduct(editId, updatedProduct);
        if (!saved) {
          await cleanupUploadedProductImages(uploadedImages.uploadedPublicIds);
          return;
        }
        images.forEach((image) => {
          if (image.file) URL.revokeObjectURL(image.url);
        });
        router.push('/products');
        return;
      }

      // Add mode
      const newProduct: AdminProduct = {
        id: `p-${Date.now()}`,
        name: title,
        sku: sku || `RL-${Date.now().toString().slice(-6)}`,
        barcode: barcode || undefined,
        category: category,
        price: finalPrice,
        promotionalPrice: promotionalPrice ? parseFloat(promotionalPrice) : undefined,
        costOfGoods: costOfGoods ? parseFloat(costOfGoods) : undefined,
        stock: finalStock,
        alertThreshold: validAlertThreshold,
        status:
          finalStock <= validAlertThreshold && finalStock > 0
            ? 'Low Stock'
            : finalStock === 0
            ? 'Out of Stock'
            : 'Active',
        image: uploadedImages.images[0]?.url || '',
        images: uploadedImages.images,
        fabricNote: fabricNote,
        description: description,
        tags: tags,
        featured: isFeatured,
        variants: productVariants.length > 0 ? productVariants : undefined,
      };

      const saved = await addProduct(newProduct);
      if (!saved) {
        await cleanupUploadedProductImages(uploadedImages.uploadedPublicIds);
        return;
      }
      images.forEach((image) => {
        if (image.file) URL.revokeObjectURL(image.url);
      });
      router.push('/products');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to save product images.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine available sizes so existing product sizes always have a toggle
  const isTrouserCategory = /trouser|pant/i.test(category);
  const allAvailableSizes = Array.from(
    new Set([
      ...baseSizes,
      ...(isTrouserCategory ? TROUSER_WAIST_SIZES : []),
      ...customSizes,
      ...selectedSizes,
    ]),
  );

  if (isEditing && isLoadingProduct) {
    return <ProductFormSkeleton isEdit={true} />;
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
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 bg-[#fbf9f2] border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden cursor-pointer"
                >
                  {category && !categories.some((c) => c.name.toLowerCase() === category.toLowerCase()) && (
                    <option value={category}>{category}</option>
                  )}
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
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
                <div className="relative mt-1.5 flex items-center">
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => {
                      setSku(e.target.value);
                      setIsSkuManuallyEdited(true);
                    }}
                    placeholder="RL-PAN-01"
                    className="w-full pl-3 pr-8 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs font-mono font-semibold text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newSku = generateCategorySku(category);
                      setSku(newSku);
                      setIsSkuManuallyEdited(false);
                    }}
                    title="Regenerate SKU based on category"
                    className="absolute right-1 text-[#717975] hover:text-[#073a2d] p-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-[#717975] mt-1 block">Category-based identifier</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#404945]">
                  Barcode / UPC
                </label>
                <div className="relative mt-1.5 flex items-center">
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="890123456789"
                    className="w-full pl-3 pr-8 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs font-mono text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setBarcode(generateBarcode())}
                    title="Regenerate unique 12-digit barcode"
                    className="absolute right-1 text-[#717975] hover:text-[#073a2d] p-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-[#717975] mt-1 block">Auto-generated 12-digit barcode</span>
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
                  min="0"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  placeholder="5"
                  className="w-full mt-1.5 px-3 py-2 bg-[#fbf9f2] border border-[#deddd3] text-xs font-mono font-semibold text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                />
                <span className="text-[10px] text-[#717975] mt-1 block">
                  Triggers &apos;Low Stock&apos; alert (default: 5 units)
                </span>
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
                  Size Labels (choose all applicable sizes)
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
                  const active = selectedSizes.includes(size);
                  const isCustom = customSizes.includes(size);
                  return (
                    <div key={size} className="relative inline-flex items-center">
                      <button
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-3.5 py-1.5 text-xs font-bold tracking-wider transition-colors border cursor-pointer ${
                          active
                            ? 'bg-[#00231a] text-white border-[#00231a] shadow-xs'
                            : 'bg-white text-[#404945] border-[#deddd3] hover:border-[#073a2d]'
                        }`}
                      >
                        {size}
                      </button>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => removeCustomSize(size)}
                          className="ml-1 text-[#ba1a1a] hover:bg-[#ffdad6]/40 p-1 rounded-xs"
                          title="Remove custom size"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSize();
                      }
                    }}
                    placeholder="Canonical size label (e.g. Bespoke, 34)"
                    className="px-3 py-1.5 text-xs bg-[#fbf9f2] border border-[#deddd3] text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                  <select
                    value={customSizeType}
                    onChange={(e) => setCustomSizeType(e.target.value as ProductSizeType)}
                    className="px-2 py-1.5 text-xs bg-[#fbf9f2] border border-[#deddd3] text-[#1b1c18]"
                    aria-label="Custom size type"
                  >
                    <option value="APPAREL">Apparel</option>
                    <option value="WAIST">Waist</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="px-3 py-1.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
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
                  <span>Selected Textile Shades</span>
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddShade(!showAddShade)}
                  className="text-xs text-[#073a2d] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Custom Shade</span>
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
                {[
                  { name: 'Navy Atelier', hex: '#0F1A2C' },
                  { name: 'Raw Silk White', hex: '#FBF9F2' },
                  { name: 'Royal Emerald', hex: '#00231A' },
                  { name: 'Antique Gold', hex: '#C79A45' },
                  { name: 'Midnight Noir', hex: '#1A1A1A' },
                  { name: 'Heritage Olive', hex: '#4B5320' },
                ].map((preset) => {
                  if (selectedShades.some((s) => s.name === preset.name)) return null;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setSelectedShades((prev) => [...prev, preset]);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 border border-[#deddd3] bg-white text-xs text-[#717975] hover:border-[#073a2d] hover:text-[#073a2d] transition-colors cursor-pointer"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>+ {preset.name}</span>
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
                    title="Pick shade color"
                  />
                  <input
                    type="text"
                    value={newShadeName}
                    onChange={(e) => setNewShadeName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddShade();
                      }
                    }}
                    placeholder="Shade Name (e.g. Vintage Beige)"
                    className="px-3 py-1.5 text-xs bg-[#fbf9f2] border border-[#deddd3] text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddShade}
                    className="px-3 py-1.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
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
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#404945] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#073a2d]" />
                    <span>GENERATED COMBINATIONS MATRIX ({productVariants.length} Active Atelier SKUs)</span>
                  </p>
                  <span className="text-[11px] text-[#717975]">
                    Size is the label customers choose (e.g. M). Add an optional actual measurement, such as Chest 40 in.
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={generateCombinationsMatrix}
                    className="shrink-0 whitespace-nowrap px-3 py-1.5 border border-[#deddd3] bg-white hover:bg-[#f0eee7] text-[11px] font-semibold text-[#404945] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Generate Matrix
                  </button>
                  <button
                    type="button"
                    onClick={() => addVariantRow()}
                    className="flex shrink-0 items-center gap-1 whitespace-nowrap px-3 py-1.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Custom Variant</span>
                  </button>
                </div>
              </div>

              <div className="border border-[#deddd3] overflow-x-auto">
                <table className="w-full min-w-[960px] table-fixed text-xs text-left">
                  <thead className="bg-[#fbf9f2] text-[#717975] uppercase text-[10px] tracking-wider border-b border-[#deddd3]">
                    <tr>
                      <th className="p-3 w-40">COLOR / SHADE</th>
                      <th className="p-3 w-72">SIZE LABEL / MEASUREMENT</th>
                      <th className="p-3 w-48">VARIANT SKU</th>
                      <th className="p-3 w-36">PRICE (BDT ৳)</th>
                      <th className="p-3 w-28">IN-STOCK</th>
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
                          <td className="min-w-[288px] p-2.5">
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={v.sizeLabel || v.size || ''}
                                onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                                aria-label="Canonical size label"
                                placeholder="e.g. M or 34"
                                className="w-full px-2 py-1.5 bg-[#fbf9f2] border border-[#deddd3] text-xs font-bold text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                              />
                              <p className="text-[10px] font-medium text-[#717975]">Actual measurement (optional)</p>
                              <div className="grid grid-cols-[minmax(0,1fr)_72px_62px] gap-1.5">
                                <input
                                  type="text"
                                  value={v.measurementDimension || ''}
                                  onChange={(e) => updateVariant(idx, 'measurementDimension', e.target.value)}
                                  placeholder="Part (e.g. chest)"
                                  aria-label="Measurement name"
                                  className="min-w-0 px-2 py-1.5 bg-white border border-[#deddd3] text-xs focus:border-[#073a2d] outline-hidden"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={v.measurementValue || ''}
                                  onChange={(e) => updateVariant(idx, 'measurementValue', e.target.value)}
                                  placeholder="40"
                                  aria-label="Measurement value"
                                  className="min-w-0 px-2 py-1.5 bg-white border border-[#deddd3] text-xs focus:border-[#073a2d] outline-hidden"
                                />
                                <select
                                  value={v.measurementUnit || 'IN'}
                                  onChange={(e) => updateVariant(idx, 'measurementUnit', e.target.value)}
                                  aria-label="Measurement unit"
                                  className="min-w-0 px-1.5 py-1.5 bg-white border border-[#deddd3] text-xs focus:border-[#073a2d] outline-hidden"
                                >
                                  <option value="IN">in</option>
                                  <option value="CM">cm</option>
                                </select>
                              </div>
                            </div>
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
                              title="Delete this variant combination"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline-block" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-xs text-[#717975]">
                          No variants configured yet. Click <strong>+ Add Custom Variant</strong> or <strong>Generate Matrix</strong> to auto-generate combinations from selected sizes and shades.
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
                  <span>Add Another Combination</span>
                </button>
                <span className="text-[11px] text-[#717975]">
                  Total variant stock:{' '}
                  <strong className="text-[#1b1c18]">
                    {productVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)} pcs
                  </strong>
                </span>
              </div>
            </div>
          </div>          </div>
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
                    <Image src={images[0].url} alt="Featured Angle" fill className="object-cover" unoptimized />
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
                    <Image src={images[1].url} alt="Angle 2" fill className="object-cover" unoptimized />
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
                    <Image src={images[2].url} alt="Angle 3" fill className="object-cover" unoptimized />
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
                    <Image src={images[3].url} alt="Angle 4" fill className="object-cover" unoptimized />
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
