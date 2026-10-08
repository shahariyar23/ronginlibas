'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Layers, Sparkles } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  itemCount: number;
  collection: string;
  image: string;
}

const INITIAL_CATEGORIES: CategoryItem[] = [];

import { adminApi } from '@/lib/api';
import { useAdmin } from '@/context/AdminContext';
import { CategoriesSkeleton } from '@/components/common/Skeleton';

export default function CategoriesPage() {
  const { refreshData } = useAdmin();
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTagline, setNewTagline] = useState('');

  // Fetch categories from backend on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await adminApi.categories.getAll();
        if (res.success && res.data && res.data.length > 0) {
          const mapped: CategoryItem[] = res.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            tagline: c.description || 'Boutique Collection',
            itemCount: c._count?.products ?? c.itemCount ?? 0,
            collection: c.name,
            image:
              c.image ||
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ',
          }));
          setCategories(mapped);
        }
      } catch (err) {
        console.warn('Categories API fetch fallback:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newName) return;
    const item: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: newName,
      slug: newName.toLowerCase().replace(/\s+/g, '-'),
      tagline: newTagline || 'Boutique Collection',
      itemCount: 0,
      collection: newName,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ',
    };
    setCategories([...categories, item]);
    setShowAddModal(false);
    setNewName('');
    setNewTagline('');

    try {
      const res = await adminApi.categories.create({
        name: newName,
        description: newTagline || undefined,
        image: item.image,
      });
      if (res.success && res.data) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === item.id
              ? {
                  ...cat,
                  id: res.data.id,
                  slug: res.data.slug || cat.slug,
                }
              : cat,
          ),
        );
      }
      await refreshData();
    } catch (err) {
      console.warn('Error saving category to backend:', err);
    }
  };

  if (isLoadingCategories) {
    return <CategoriesSkeleton />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#deddd3] pb-6">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#717975]">
            SILHOUETTE ARCHITECTURE • DHAKA ATELIER
          </span>
          <h1 className="text-3xl font-serif text-[#1b1c18] mt-1 tracking-tight">Categories</h1>
          <p className="text-xs text-[#69726d] mt-1">
            Curated apparel taxonomies, bespoke collection capsules, and editorial hierarchy.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00231a] hover:bg-[#073a2d] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ ADD CATEGORY</span>
        </button>
      </div>

      {/* Categories Grid or Empty State */}
      {categories.length === 0 ? (
        <div className="bg-white border border-[#deddd3] p-12 text-center space-y-3">
          <Layers className="w-8 h-8 text-[#717975] mx-auto opacity-40" />
          <h3 className="font-serif text-lg text-[#1b1c18]">No Categories in Catalog</h3>
          <p className="text-xs text-[#717975] max-w-sm mx-auto">
            Create silhouette capsules like Panjabi, Shirts, or Formal Wear to organize products.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#073a2d] text-white text-xs font-semibold uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Inaugural Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-[#deddd3] p-5 shadow-xs flex flex-col justify-between hover:border-[#c79a45] transition-all group"
          >
            <div>
              <div className="relative aspect-16/9 bg-[#f0eee7] border border-[#deddd3] overflow-hidden mb-4">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-[#00231a] text-white px-2 py-0.5">
                  {cat.collection}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#1b1c18]">{cat.name}</h3>
                  <p className="text-xs text-[#69726d] mt-0.5">{cat.tagline}</p>
                </div>
                <span className="text-xs font-mono font-bold bg-[#f0eee7] px-2 py-1 text-[#073a2d]">
                  {cat.itemCount} SKUs
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#f0eee7] flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-[#717975]">slug: /{cat.slug}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Edit category: ${cat.name}`)}
                  className="p-1 text-[#717975] hover:text-[#073a2d]"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCategories(categories.filter((c) => c.id !== cat.id))}
                  className="p-1 text-[#717975] hover:text-[#ba1a1a]"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#deddd3] shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-serif text-lg font-bold text-[#073a2d]">Add New Category</h3>
            <p className="text-xs text-[#717975] mt-1">
              Create a distinct apparel division for catalog organization.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Waistcoats & Sherwanis"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#717975]">
                  Editorial Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ancestral brocade tailoring for formal occasions"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-[#deddd3] text-xs text-[#1b1c18] focus:border-[#073a2d] outline-hidden"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-[#deddd3] text-xs text-[#717975] hover:bg-[#f0eee7]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-[#00231a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#073a2d]"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
