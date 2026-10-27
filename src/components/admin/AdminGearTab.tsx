import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { Language, StudioGearItem, GearCategory, GearStatus } from '../../types';
import {
  subscribeGear,
  createGear,
  updateGear,
  deleteGear,
} from '../../services/studioErpService';

interface AdminGearTabProps {
  lang: Language;
}

const INITIAL_GEAR_PRESETS: StudioGearItem[] = [
  {
    id: 'gear_fx3_cinema',
    name: 'Sony FX3 Cinema Line Camera (Full Frame 4K)',
    category: 'camera',
    serialNumber: 'SN-FX3-8821',
    status: 'available',
    location: 'Studio Room A (Main Cam)',
    conditionNotes: 'حالة ممتازة 10/10 مع كروت Tough V90',
  },
  {
    id: 'gear_a74_bcam',
    name: 'Sony A7 IV Full-Frame (B-Cam Close-up)',
    category: 'camera',
    serialNumber: 'SN-A74-1049',
    status: 'available',
    location: 'Studio Room A',
    conditionNotes: 'جاهزة وموصولة بـ HDMI Switcher',
  },
  {
    id: 'gear_gm2_2470',
    name: 'Sony FE 24-70mm f/2.8 GM II Lens',
    category: 'lens',
    serialNumber: 'SN-LNS-2470',
    status: 'available',
    location: 'خزينة العدسات Lens Vault',
    conditionNotes: 'نظيفة تماماً مع فلتر UV',
  },
  {
    id: 'gear_sm7b_quad',
    name: 'Shure SM7B Vocal Microphones (Set of 4)',
    category: 'audio',
    serialNumber: 'SHR-SM7B-QUAD',
    status: 'in_use',
    location: 'ترابيزة البودكاست الرئيسية',
    conditionNotes: 'مع مايك آرمز Cloudlifter CL-1',
  },
  {
    id: 'gear_aputure_300d',
    name: 'Aputure 300d II Key Light + Light Dome III',
    category: 'lighting',
    serialNumber: 'AP-300D-01',
    status: 'available',
    location: 'جريد الإضاءة بالسقف (Ceiling Grid)',
    conditionNotes: 'إضاءة رئيسية Key Light مع سوفت بوكس 90سم',
  },
  {
    id: 'gear_amaron_200x',
    name: 'Amaron 200x Bi-Color Studio Rim Light',
    category: 'lighting',
    serialNumber: 'AM-200X-02',
    status: 'available',
    location: 'استوديو البودكاست (Back Light)',
    conditionNotes: 'إضاءة خلفية قابلة لتغيير درجة اللون الكلفن',
  },
];

export const AdminGearTab: React.FC<AdminGearTabProps> = ({ lang }) => {
  const isAr = lang === 'ar';

  const [gearList, setGearList] = useState<StudioGearItem[]>(INITIAL_GEAR_PRESETS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Gear Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GearCategory>('camera');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState<GearStatus>('available');
  const [location, setLocation] = useState('Studio Room A');
  const [conditionNotes, setConditionNotes] = useState('');

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const hasAttemptedSeed = useRef(false);

  useEffect(() => {
    const unsub = subscribeGear(
      (items) => {
        if (items && items.length > 0) {
          setGearList(items);
        } else {
          // If database is empty, seed initial presets safely once
          setGearList(INITIAL_GEAR_PRESETS);
          if (!hasAttemptedSeed.current) {
            hasAttemptedSeed.current = true;
            (async () => {
              try {
                for (const g of INITIAL_GEAR_PRESETS) {
                  await createGear({
                    name: g.name,
                    category: g.category,
                    serialNumber: g.serialNumber,
                    status: g.status,
                    location: g.location,
                    conditionNotes: g.conditionNotes,
                  });
                }
              } catch (seedErr) {
                console.warn('Initial gear presets seed notice:', seedErr);
              }
            })();
          }
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Gear inventory listener error:', error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleAddGear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setErrorMessage(null);
      await createGear({
        name: name.trim(),
        category,
        serialNumber: serialNumber.trim() || undefined,
        status,
        location: location.trim() || undefined,
        conditionNotes: conditionNotes.trim() || undefined,
      });

      setShowAddModal(false);
      setName('');
      setSerialNumber('');
      setConditionNotes('');
      setActionSuccess(isAr ? 'تمت إضافة الجهاز للعهدة بنجاح' : 'Equipment added to inventory');
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: unknown) {
      console.error('Failed to add gear:', err);
      setErrorMessage(isAr ? 'تعذر حفظ الجهاز في قاعدة البيانات، تحقق من الصلاحيات.' : 'Failed to save equipment.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: GearStatus) => {
    try {
      setErrorMessage(null);
      // Optimistic UI update
      setGearList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      await updateGear(id, { status: newStatus });
      setActionSuccess(isAr ? 'تم تحديث حالة المعدة' : 'Status updated');
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (err: unknown) {
      console.error('Failed to update status:', err);
      setErrorMessage(isAr ? 'تعذر تحديث الحالة في السيرفر.' : 'Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(isAr ? 'حذف هذا الجهاز من العهدة نهائياً؟' : 'Remove equipment from inventory?')) return;
    try {
      setErrorMessage(null);
      setGearList((prev) => prev.filter((item) => item.id !== id));
      await deleteGear(id);
      setActionSuccess(isAr ? 'تم حذف الجهاز من العهدة' : 'Equipment removed');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: unknown) {
      console.error('Failed to delete gear:', err);
      setErrorMessage(isAr ? 'تعذر حذف الجهاز، تحقق من الاتصال.' : 'Failed to delete equipment.');
    }
  };

  const filtered = gearList.filter((g) => {
    const matchesCat = categoryFilter === 'all' || g.category === categoryFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (g.name && g.name.toLowerCase().includes(q)) ||
      (g.serialNumber && g.serialNumber.toLowerCase().includes(q)) ||
      (g.location && g.location.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 font-brand">
            <Camera className="w-5 h-5 text-[#C82626]" />
            <span>{isAr ? 'إدارة عهدة ومعدات استوديو KIN' : 'Studio Gear & Equipment Tracker'}</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isAr
              ? 'متابعة كاميرات السينما، الميكروفونات، الإضاءات، والعدسات وتحديد حالتها (متاحة، قيد التصوير، صيانة، خارجي).'
              : 'Track cinema cameras, microphones, lighting, and lenses status.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C82626] hover:bg-[#a81e1e] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة جهاز جديد' : 'Add Equipment'}</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث باسم الكاميرا، الميكروفون، أو السيريال...' : 'Search gear, serial, or room...'}
            className="w-full ps-10 pe-4 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#C82626]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: isAr ? 'الكل' : 'All' },
            { id: 'camera', label: isAr ? 'الكاميرات' : 'Cameras' },
            { id: 'lens', label: isAr ? 'العدسات' : 'Lenses' },
            { id: 'audio', label: isAr ? 'الصوت' : 'Audio' },
            { id: 'lighting', label: isAr ? 'الإضاءة' : 'Lighting' },
            { id: 'grip', label: isAr ? 'الحوامل' : 'Grip' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gear Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white leading-snug">
                  {item.name}
                </h4>
                <button
                  onClick={() => handleDelete(item.id)}
                  title={isAr ? 'حذف المعدة' : 'Delete'}
                  className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 uppercase">
                  {item.category}
                </span>

                {item.serialNumber && (
                  <span className="text-[11px] font-mono text-neutral-400">
                    #{item.serialNumber}
                  </span>
                )}
              </div>

              {item.location && (
                <div className="text-xs text-neutral-500 mb-1">
                  {isAr ? 'الموقع: ' : 'Location: '}
                  <span className="text-neutral-700 dark:text-neutral-300 font-medium">{item.location}</span>
                </div>
              )}

              {item.conditionNotes && (
                <div className="text-xs text-neutral-400 italic line-clamp-2">
                  "{item.conditionNotes}"
                </div>
              )}
            </div>

            {/* Status Selector Bar */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 mt-4 flex items-center justify-between text-xs">
              <span className="text-neutral-400">{isAr ? 'الحالة الحالية:' : 'Status:'}</span>
              <select
                value={item.status}
                onChange={(e) => handleStatusChange(item.id, e.target.value as GearStatus)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border-none focus:ring-1 focus:ring-[#C82626] cursor-pointer ${
                  item.status === 'available'
                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : item.status === 'in_use'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : item.status === 'maintenance'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                }`}
              >
                <option value="available">{isAr ? 'متاح بالاستوديو' : 'Available'}</option>
                <option value="in_use">{isAr ? 'قيد التصوير الآن' : 'In Use'}</option>
                <option value="external_shoot">{isAr ? 'تصوير خارجي Outdoor' : 'External Shoot'}</option>
                <option value="maintenance">{isAr ? 'قيد الصيانة والتنظيف' : 'Maintenance'}</option>
              </select>
            </div>

          </div>
        ))}
      </div>

      {/* Modal: Add Equipment */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleAddGear}
            className="bg-white dark:bg-[#1A1817] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
          >
            <h4 className="font-bold text-base text-neutral-900 dark:text-white font-brand">
              {isAr ? 'إضافة جهاز أو معدة إلى عهدة الاستوديو' : 'Add New Equipment'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">
                  {isAr ? 'اسم الجهاز والموديل *' : 'Equipment Name & Model *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sony FX3 / Shure SM7B"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">
                  {isAr ? 'التصنيف:' : 'Category:'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GearCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                >
                  <option value="camera">{isAr ? 'كاميرا' : 'Camera'}</option>
                  <option value="lens">{isAr ? 'عدسة' : 'Lens'}</option>
                  <option value="audio">{isAr ? 'صوت وميكروفون' : 'Audio'}</option>
                  <option value="lighting">{isAr ? 'إضاءة سوفت بوكس' : 'Lighting'}</option>
                  <option value="grip">{isAr ? 'ترايبود وحوامل' : 'Grip / Tripod'}</option>
                  <option value="accessories">{isAr ? 'إكسسوارات وكابلات' : 'Accessories'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">
                  {isAr ? 'السيريال نمبر:' : 'Serial Number:'}
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="SN-10294"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">
                  {isAr ? 'الموقع / الغرفة بالاستوديو:' : 'Location / Room:'}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Studio Room A"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">
                  {isAr ? 'الحالة الأولية:' : 'Initial Status:'}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as GearStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                >
                  <option value="available">{isAr ? 'متاح بالاستوديو' : 'Available'}</option>
                  <option value="in_use">{isAr ? 'قيد الاستخدام' : 'In Use'}</option>
                  <option value="maintenance">{isAr ? 'قيد الصيانة' : 'Maintenance'}</option>
                  <option value="external_shoot">{isAr ? 'تصوير خارجي' : 'External Shoot'}</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">
                  {isAr ? 'ملاحظات وحالة الجهاز:' : 'Condition Notes:'}
                </label>
                <input
                  type="text"
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  placeholder={isAr ? 'حالة ممتازة، كابل جديد، نظيف...' : 'Clean lens, pristine condition...'}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-neutral-500 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#C82626] hover:bg-[#a81e1e] text-white text-xs font-bold shadow cursor-pointer transition-colors"
              >
                {isAr ? 'حفظ الجهاز' : 'Save Equipment'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
