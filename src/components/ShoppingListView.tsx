import { useMemo, useState } from 'react';
import { Check, Plus, Printer, RotateCcw, Trash2 } from 'lucide-react';
import { SHOPPING_WEEKS } from '../data/shopping';
import type { CustomShoppingItem, ShoppingItemState } from '../types';
import { clampNumber, validateNumericInput } from '../utils/storage';
import { SafeImage } from './SafeImage';

interface ShoppingListViewProps {
  shoppingState: Record<string, ShoppingItemState>;
  customItems: CustomShoppingItem[];
  onToggleItem: (weekIndex: number, itemId: string, defaultPrice: number) => void;
  onUpdatePrice: (weekIndex: number, itemId: string, price: number) => void;
  onAddCustomItem: (weekIndex: number, name: string, quantity: string, price: number) => void;
  onToggleCustomItem: (id: string) => void;
  onUpdateCustomPrice: (id: string, price: number) => void;
  onDeleteCustomItem: (id: string) => void;
  onResetWeek: (weekIndex: number) => void;
}

type StatusFilter = 'all' | 'remaining' | 'bought';

export function ShoppingListView({
  shoppingState,
  customItems,
  onToggleItem,
  onUpdatePrice,
  onAddCustomItem,
  onToggleCustomItem,
  onUpdateCustomPrice,
  onDeleteCustomItem,
  onResetWeek,
}: ShoppingListViewProps) {
  const [weekIndex, setWeekIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Custom item form state + validation
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});

  const week = SHOPPING_WEEKS[weekIndex];
  const weekCustomItems = useMemo(
    () => customItems.filter((c) => c.weekIndex === weekIndex),
    [customItems, weekIndex],
  );

  const combinedStats = useMemo(() => {
    let total = 0;
    let bought = 0;
    const count = week.items.length + weekCustomItems.length;

    week.items.forEach((item) => {
      const key = `${weekIndex}-${item.id}`;
      const state = shoppingState[key];
      const price = state ? state.price : item.defaultPrice;
      const checked = state ? state.checked : false;
      total += price;
      if (checked) bought++;
    });

    weekCustomItems.forEach((item) => {
      total += item.price;
      if (item.checked) bought++;
    });

    return {
      count,
      bought,
      total,
      pct: count > 0 ? Math.round((bought / count) * 100) : 0,
    };
  }, [week, weekIndex, shoppingState, weekCustomItems]);

  const filteredTemplateItems = useMemo(() => {
    return week.items.filter((item) => {
      const key = `${weekIndex}-${item.id}`;
      const checked = shoppingState[key]?.checked ?? false;
      if (statusFilter === 'bought') return checked;
      if (statusFilter === 'remaining') return !checked;
      return true;
    });
  }, [week.items, weekIndex, shoppingState, statusFilter]);

  const filteredCustomItems = useMemo(() => {
    return weekCustomItems.filter((item) => {
      if (statusFilter === 'bought') return item.checked;
      if (statusFilter === 'remaining') return !item.checked;
      return true;
    });
  }, [weekCustomItems, statusFilter]);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setFormError('اكتب اسم الحاجة اللي تحب تزيدها.');
      return;
    }
    const priceValidation = validateNumericInput(newPrice || '0', {
      label: 'السعر',
      min: 0,
      max: 500,
      required: false,
      decimals: 2,
    });
    if (!priceValidation.valid) {
      setFormError(priceValidation.error ?? 'سعر غير صحيح.');
      return;
    }

    onAddCustomItem(
      weekIndex,
      trimmedName,
      newQty.trim() || '1 حبة',
      priceValidation.value ?? 0,
    );
    setNewName('');
    setNewQty('');
    setNewPrice('');
    setFormError(null);
  };

  const commitPriceDraft = (
    draftKey: string,
    raw: string,
    fallback: number,
    onCommit: (val: number) => void,
  ) => {
    const res = validateNumericInput(raw, {
      label: 'السعر',
      min: 0,
      max: 500,
      required: true,
      decimals: 2,
    });
    if (res.valid && res.value !== undefined) {
      onCommit(clampNumber(res.value, 0, 500, 2));
    } else {
      onCommit(fallback);
    }
    setPriceDrafts((prev) => {
      const next = { ...prev };
      delete next[draftKey];
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* Header & Week Switcher */}
      <section className="bg-white rounded-2xl border border-[#E3E8E2] p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#10442F]">
              قائمة الشرا الأسبوعية
            </h1>
            <p className="text-sm text-[#5A6B61]">{week.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[42px] px-3.5 rounded-xl border border-[#DCE5DD] text-xs font-bold text-[#1D2D24] flex items-center gap-1.5 hover:bg-[#F6F7F4] transition-colors whitespace-nowrap"
            >
              <Printer className="w-4 h-4 text-[#146C4B]" />
              اطبع القائمة
            </button>
            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="min-h-[42px] px-3.5 rounded-xl border border-[#DCE5DD] text-xs font-bold text-[#8A3B12] flex items-center gap-1.5 hover:bg-[#FDF3EE] transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              صفّر الأسبوع
            </button>
          </div>
        </div>

        {/* Week Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 no-print">
          {SHOPPING_WEEKS.map((w) => (
            <button
              key={w.weekIndex}
              type="button"
              onClick={() => {
                setWeekIndex(w.weekIndex);
                setConfirmResetOpen(false);
              }}
              className={`min-h-[44px] px-3 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
                weekIndex === w.weekIndex
                  ? 'bg-[#146C4B] text-white'
                  : 'bg-[#F6F7F4] text-[#495A50] hover:bg-[#EAF3EC]'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>

        {/* Non-blocking inline confirmation for reset */}
        {confirmResetOpen && (
          <div className="rounded-xl bg-[#FDF3EE] border border-[#F2CBB8] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
            <p className="text-sm font-medium text-[#7A2E0E]">
              متأكّد تحب تصفّر اختيارات وأسعار {week.label}؟
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetWeek(weekIndex);
                  setPriceDrafts({});
                  setConfirmResetOpen(false);
                }}
                className="min-h-[40px] px-4 rounded-lg bg-[#B43C15] text-white text-xs font-bold"
              >
                نعم، صفّر
              </button>
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="min-h-[40px] px-4 rounded-lg bg-white border border-[#DCE5DD] text-xs font-semibold text-[#1D2D24]"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* 3-Column Budget & Progress Summary */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          <div className="rounded-xl bg-[#F6F7F4] p-3 sm:p-4">
            <div className="text-xs text-[#64756B]">عدد الحاجات</div>
            <div className="text-xl sm:text-2xl font-bold text-[#1D2D24] tabular-nums mt-0.5">
              {combinedStats.count}
            </div>
          </div>
          <div className="rounded-xl bg-[#EAF3EC] p-3 sm:p-4">
            <div className="text-xs text-[#10442F]">شريت</div>
            <div className="text-xl sm:text-2xl font-bold text-[#146C4B] tabular-nums mt-0.5">
              {combinedStats.bought}
            </div>
          </div>
          <div className="rounded-xl bg-[#FDF7EB] p-3 sm:p-4">
            <div className="text-xs text-[#8A5312]">المجموع</div>
            <div className="text-xl sm:text-2xl font-bold text-[#9A5B13] tabular-nums mt-0.5">
              {combinedStats.total.toFixed(2)} <span className="text-xs font-semibold">دت</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#64756B] tabular-nums">
            <span>تقدّم القضية</span>
            <span>{combinedStats.pct}%</span>
          </div>
          <div className="h-2.5 bg-[#EEF2EE] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#146C4B] transition-[width] duration-300 rounded-full"
              style={{ width: `${combinedStats.pct}%` }}
            />
          </div>
        </div>
      </section>

      {/* Filter & Add Custom Item */}
      <section className="bg-white rounded-2xl border border-[#E3E8E2] p-4 sm:p-5 space-y-4 no-print">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#F6F7F4] p-1 rounded-xl">
            {(
              [
                ['all', 'الكل'],
                ['remaining', 'مازال ما شريتش'],
                ['bought', 'شريت'],
              ] as [StatusFilter, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={`min-h-[38px] px-3 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  statusFilter === key
                    ? 'bg-white text-[#10442F] shadow-xs'
                    : 'text-[#5A6B61] hover:text-[#1D2D24]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs text-[#64756B]">
            الأسعار بالدينار التونسي · تتحفظ أوتوماتيكياً
          </span>
        </div>

        {/* Add Custom Item Form */}
        <form onSubmit={handleAddCustom} className="pt-3 border-t border-[#EEF2EE] space-y-2.5">
          <div className="text-xs font-bold text-[#10442F]">زيد حاجة أخرى لقائمة الأسبوع</div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="اسم الحاجة (مثلاً: زيت زيتون)"
              className="sm:col-span-5 min-h-[44px] px-3 rounded-xl border border-[#DCE5DD] text-sm focus:outline-none focus:border-[#146C4B]"
            />
            <input
              type="text"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              placeholder="الكمية (مثلاً: 1 لتر)"
              className="sm:col-span-3 min-h-[44px] px-3 rounded-xl border border-[#DCE5DD] text-sm focus:outline-none focus:border-[#146C4B]"
            />
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="500"
              step="0.1"
              value={newPrice}
              onChange={(e) => {
                setNewPrice(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="السعر (دت)"
              className="sm:col-span-2 min-h-[44px] px-3 rounded-xl border border-[#DCE5DD] text-sm tabular-nums focus:outline-none focus:border-[#146C4B]"
            />
            <button
              type="submit"
              className="sm:col-span-2 min-h-[44px] px-4 rounded-xl bg-[#146C4B] text-white text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-[#10573C] transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              زيد
            </button>
          </div>
          {formError && (
            <p className="text-xs font-medium text-[#B43C15]" role="alert">
              {formError}
            </p>
          )}
        </form>
      </section>

      {/* Shopping Items List */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredTemplateItems.length === 0 && filteredCustomItems.length === 0 ? (
          <div className="md:col-span-2 bg-white rounded-2xl border border-[#E3E8E2] p-8 text-center text-sm text-[#64756B]">
            ما فمّاش حاجات في الفلتر هذا حالياً.
          </div>
        ) : (
          <>
            {filteredTemplateItems.map((item) => {
              const key = `${weekIndex}-${item.id}`;
              const state = shoppingState[key];
              const checked = state?.checked ?? false;
              const currentPrice = state ? state.price : item.defaultPrice;
              const draft = priceDrafts[key];

              return (
                <div
                  key={key}
                  className={`bg-white rounded-2xl border p-3 flex items-center gap-3 transition-colors ${
                    checked ? 'border-[#CFE5D6] bg-[#F7FBF8]' : 'border-[#E3E8E2]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onToggleItem(weekIndex, item.id, item.defaultPrice)}
                    aria-pressed={checked}
                    aria-label={checked ? `إلغاء تحديد ${item.name}` : `تحديد ${item.name} كمشترى`}
                    className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                      checked
                        ? 'bg-[#146C4B] border-[#146C4B] text-white'
                        : 'bg-[#F6F7F4] border-[#DCE5DD] text-transparent hover:border-[#146C4B]'
                    }`}
                  >
                    <Check className="w-5 h-5" />
                  </button>

                  <SafeImage
                    imageKey={item.imageKey}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 bg-[#EAF3EC]"
                  />

                  <div
                    onClick={() => onToggleItem(weekIndex, item.id, item.defaultPrice)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div
                      className={`text-sm font-bold truncate ${
                        checked ? 'line-through text-[#7A8B81]' : 'text-[#1D2D24]'
                      }`}
                    >
                      {item.name}
                    </div>
                    <div className="text-xs text-[#64756B] flex items-center gap-1.5 mt-0.5">
                      <span>{item.quantity}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="500"
                      step="0.1"
                      aria-label={`سعر ${item.name} بالدينار`}
                      value={draft !== undefined ? draft : String(currentPrice)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPriceDrafts((prev) => ({ ...prev, [key]: val }));
                        const parsed = Number(val);
                        if (val !== '' && Number.isFinite(parsed) && parsed >= 0 && parsed <= 500) {
                          onUpdatePrice(weekIndex, item.id, clampNumber(parsed, 0, 500, 2));
                        }
                      }}
                      onBlur={(e) =>
                        commitPriceDraft(key, e.target.value, currentPrice, (v) =>
                          onUpdatePrice(weekIndex, item.id, v),
                        )
                      }
                      className="w-20 min-h-[42px] px-2 rounded-xl border border-[#DCE5DD] text-sm font-semibold text-center tabular-nums focus:outline-none focus:border-[#146C4B]"
                    />
                    <span className="text-xs font-medium text-[#64756B]">دت</span>
                  </div>
                </div>
              );
            })}

            {filteredCustomItems.map((item) => {
              const draftKey = `custom-${item.id}`;
              const draft = priceDrafts[draftKey];

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-3 flex items-center gap-3 transition-colors ${
                    item.checked ? 'border-[#CFE5D6] bg-[#F7FBF8]' : 'border-[#E3E8E2]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onToggleCustomItem(item.id)}
                    aria-pressed={item.checked}
                    aria-label={item.checked ? `إلغاء تحديد ${item.name}` : `تحديد ${item.name}`}
                    className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                      item.checked
                        ? 'bg-[#146C4B] border-[#146C4B] text-white'
                        : 'bg-[#F6F7F4] border-[#DCE5DD] text-transparent hover:border-[#146C4B]'
                    }`}
                  >
                    <Check className="w-5 h-5" />
                  </button>

                  <div
                    onClick={() => onToggleCustomItem(item.id)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div
                      className={`text-sm font-bold truncate ${
                        item.checked ? 'line-through text-[#7A8B81]' : 'text-[#1D2D24]'
                      }`}
                    >
                      {item.name}
                    </div>
                    <div className="text-xs text-[#64756B] mt-0.5">
                      {item.quantity} · إضافة شخصية
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="500"
                      step="0.1"
                      aria-label={`سعر ${item.name} بالدينار`}
                      value={draft !== undefined ? draft : String(item.price)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPriceDrafts((prev) => ({ ...prev, [draftKey]: val }));
                        const parsed = Number(val);
                        if (val !== '' && Number.isFinite(parsed) && parsed >= 0 && parsed <= 500) {
                          onUpdateCustomPrice(item.id, clampNumber(parsed, 0, 500, 2));
                        }
                      }}
                      onBlur={(e) =>
                        commitPriceDraft(draftKey, e.target.value, item.price, (v) =>
                          onUpdateCustomPrice(item.id, v),
                        )
                      }
                      className="w-20 min-h-[42px] px-2 rounded-xl border border-[#DCE5DD] text-sm font-semibold text-center tabular-nums focus:outline-none focus:border-[#146C4B]"
                    />
                    <span className="text-xs font-medium text-[#64756B]">دت</span>
                    <button
                      type="button"
                      onClick={() => onDeleteCustomItem(item.id)}
                      aria-label={`حذف ${item.name}`}
                      className="min-h-[40px] min-w-[40px] rounded-xl text-[#8A3B12] hover:bg-[#FDF3EE] flex items-center justify-center no-print"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </section>
    </div>
  );
}
