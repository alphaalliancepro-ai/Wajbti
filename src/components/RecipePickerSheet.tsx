import { useEffect } from 'react';
import { Check, Clock, Shuffle, X } from 'lucide-react';
import { CATEGORY_LABELS, RECIPES_BY_CATEGORY } from '../data/recipes';
import type { MealCategory, Recipe } from '../types';
import { SafeImage } from './SafeImage';

interface RecipePickerSheetProps {
  category: MealCategory | null;
  currentRecipeId: string | null;
  activeDay: number;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
  onOpenDetail: (recipe: Recipe) => void;
}

export function RecipePickerSheet({
  category,
  currentRecipeId,
  activeDay,
  onClose,
  onSelect,
  onOpenDetail,
}: RecipePickerSheetProps) {
  useEffect(() => {
    if (!category) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [category, onClose]);

  if (!category) return null;

  const list = RECIPES_BY_CATEGORY[category];
  const meta = CATEGORY_LABELS[category];

  const handleRandom = () => {
    const others = list.filter((r) => r.id !== currentRecipeId);
    const pool = others.length > 0 ? others : list;
    const random = pool[Math.floor(Math.random() * pool.length)];
    onSelect(random);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="picker-title"
    >
      <div
        className="w-full sm:max-w-2xl max-h-[90dvh] bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-[#E3E8E2]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden pt-2.5 pb-1 bg-white shrink-0">
          <div className="w-10 h-1.5 bg-[#D4DDD6] rounded-full mx-auto" />
        </div>

        <div className="px-5 py-4 border-b border-[#E3E8E2] flex items-center justify-between gap-3 shrink-0">
          <div>
            <h2 id="picker-title" className="text-lg font-bold text-[#10442F]">
              بدّل {meta.title} · نهار {activeDay}
            </h2>
            <p className="text-xs text-[#64756B]">
              اختار من بين {list.length} وصفات مضبوطة السعرات
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRandom}
              className="min-h-[40px] px-3 rounded-xl bg-[#EAF3EC] text-[#146C4B] text-xs font-bold flex items-center gap-1.5 hover:bg-[#DCECE0] transition-colors whitespace-nowrap"
            >
              <Shuffle className="w-3.5 h-3.5" />
              اقتراح سريع
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق"
              className="min-h-[44px] min-w-[44px] rounded-xl text-[#495A50] flex items-center justify-center hover:bg-[#F6F7F4]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5 space-y-3 pb-safe">
          {list.map((recipe) => {
            const isSelected = recipe.id === currentRecipeId;
            return (
              <div
                key={recipe.id}
                className={`rounded-2xl border p-3 flex gap-3.5 items-center transition-colors ${
                  isSelected
                    ? 'border-[#146C4B] bg-[#F3F9F5]'
                    : 'border-[#E3E8E2] bg-white hover:border-[#C5D3C9]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelect(recipe);
                    onClose();
                  }}
                  className="flex-1 flex items-center gap-3.5 text-right min-w-0"
                >
                  <SafeImage
                    imageKey={recipe.imageKey}
                    alt={recipe.title}
                    className="w-20 h-20 sm:w-24 sm:h-20 rounded-xl object-cover shrink-0 bg-[#EAF3EC]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-[#1D2D24] truncate">
                        {recipe.title}
                      </h3>
                      {isSelected && (
                        <span className="text-[#146C4B] shrink-0" aria-label="مختارة">
                          <Check className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64756B] line-clamp-2 mt-0.5">
                      {recipe.subtitle}
                    </p>
                    <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-xs text-[#495A50] mt-2 tabular-nums">
                      <span className="font-semibold text-[#1D2D24]">{recipe.calories} kcal</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[#146C4B]">{recipe.protein}غ بروتين</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.prepMinutes} دق
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{recipe.costDT.toFixed(1)} دت</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDetail(recipe)}
                  className="min-h-[44px] px-3 rounded-xl border border-[#E3E8E2] text-xs font-semibold text-[#1D2D24] hover:bg-[#F6F7F4] transition-colors shrink-0 whitespace-nowrap"
                >
                  التفاصيل
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
