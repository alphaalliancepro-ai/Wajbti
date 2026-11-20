import { useEffect, useState } from 'react';
import {
  Check,
  Clock,
  Flame,
  RefreshCw,
  Sparkles,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { CATEGORY_LABELS } from '../data/recipes';
import type { Recipe } from '../types';
import { SafeImage } from './SafeImage';

interface RecipeDetailSheetProps {
  recipe: Recipe | null;
  activeDay: number;
  isCurrentlySelected: boolean;
  onClose: () => void;
  onSelectForDay: (recipe: Recipe) => void;
  onOpenPicker?: (recipe: Recipe) => void;
}

export function RecipeDetailSheet({
  recipe,
  activeDay,
  isCurrentlySelected,
  onClose,
  onSelectForDay,
  onOpenPicker,
}: RecipeDetailSheetProps) {
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);

  useEffect(() => {
    setCheckedSteps([]);
    setCheckedIngredients([]);
  }, [recipe?.id]);

  useEffect(() => {
    if (!recipe) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [recipe, onClose]);

  if (!recipe) return null;

  const categoryMeta = CATEGORY_LABELS[recipe.category];
  const totalMacroGrams = Math.max(1, recipe.protein + recipe.carbs + recipe.fats);
  const proteinPct = Math.round((recipe.protein / totalMacroGrams) * 100);
  const carbsPct = Math.round((recipe.carbs / totalMacroGrams) * 100);
  const fatsPct = Math.max(0, 100 - proteinPct - carbsPct);

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-detail-title"
    >
      <div
        className="w-full sm:max-w-2xl max-h-[92dvh] bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-[#E3E8E2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab handle */}
        <div className="sm:hidden pt-2.5 pb-1 bg-white shrink-0">
          <div className="w-10 h-1.5 bg-[#D4DDD6] rounded-full mx-auto" />
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[#EAF3EC]">
            <SafeImage
              imageKey={recipe.imageKey}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق التفاصيل"
              className="absolute top-3 left-3 min-h-[44px] min-w-[44px] rounded-full bg-white/90 text-[#1D2D24] flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 right-4 left-4 text-white">
              <div className="flex items-center gap-2 text-xs text-white/90 mb-1">
                <span>{categoryMeta.title}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{recipe.prepMinutes} دقيقة</span>
                <span aria-hidden="true">·</span>
                <span>{recipe.difficulty}</span>
              </div>
              <h2 id="recipe-detail-title" className="text-xl sm:text-2xl font-bold leading-snug">
                {recipe.title}
              </h2>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            <p className="text-[15px] leading-relaxed text-[#495A50]">
              {recipe.subtitle}
            </p>

            {/* Macro breakdown bar + 4-column summary */}
            <div className="space-y-3 border-y border-[#E3E8E2] py-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-xs text-[#64756B]">السعرات</div>
                  <div className="text-lg font-bold text-[#1D2D24] tabular-nums">
                    {recipe.calories}
                  </div>
                  <div className="text-[11px] text-[#64756B]">kcal</div>
                </div>
                <div>
                  <div className="text-xs text-[#64756B]">بروتين</div>
                  <div className="text-lg font-bold text-[#146C4B] tabular-nums">
                    {recipe.protein}غ
                  </div>
                  <div className="text-[11px] text-[#64756B] tabular-nums">{proteinPct}%</div>
                </div>
                <div>
                  <div className="text-xs text-[#64756B]">نشويات</div>
                  <div className="text-lg font-bold text-[#1D2D24] tabular-nums">
                    {recipe.carbs}غ
                  </div>
                  <div className="text-[11px] text-[#64756B] tabular-nums">{carbsPct}%</div>
                </div>
                <div>
                  <div className="text-xs text-[#64756B]">دهون</div>
                  <div className="text-lg font-bold text-[#B45309] tabular-nums">
                    {recipe.fats}غ
                  </div>
                  <div className="text-[11px] text-[#64756B] tabular-nums">{fatsPct}%</div>
                </div>
              </div>

              <div className="h-2 w-full rounded-full overflow-hidden bg-[#EEF2EE] flex">
                <div
                  style={{ width: `${proteinPct}%` }}
                  className="bg-[#146C4B]"
                  title={`بروتين ${proteinPct}%`}
                />
                <div
                  style={{ width: `${carbsPct}%` }}
                  className="bg-[#56A87B]"
                  title={`نشويات ${carbsPct}%`}
                />
                <div
                  style={{ width: `${fatsPct}%` }}
                  className="bg-[#E59A38]"
                  title={`دهون ${fatsPct}%`}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#64756B]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  تحضير في {recipe.prepMinutes} دق
                </span>
                <span className="tabular-nums font-medium text-[#1D2D24]">
                  التكلفة التقريبية: {recipe.costDT.toFixed(1)} دينار
                </span>
              </div>
            </div>

            {/* Ingredients (tap to check off while prepping) */}
            <section>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-base font-bold text-[#10442F] flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-[#146C4B]" />
                  المكوّنات والمقادير
                </h3>
                <span className="text-[11px] text-[#64756B]">اضغط لتعليم المكوّن الجاهز</span>
              </div>
              <ul className="divide-y divide-[#EEF2EE]">
                {recipe.ingredients.map((ing, idx) => {
                  const done = checkedIngredients.includes(idx);
                  return (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => toggleIngredient(idx)}
                        className="w-full py-2.5 flex items-center justify-between gap-4 text-sm text-right hover:bg-[#F9FAF8] transition-colors"
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              done
                                ? 'bg-[#146C4B] border-[#146C4B] text-white'
                                : 'border-[#D4DDD6] text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </span>
                          <span
                            className={`font-medium ${
                              done ? 'line-through text-[#7A8B81]' : 'text-[#1D2D24]'
                            }`}
                          >
                            {ing.name}
                          </span>
                        </span>
                        <span className="text-[#146C4B] font-semibold tabular-nums whitespace-nowrap">
                          {ing.amount}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Spices & Aromatics (التفويحة والبهارات) */}
            <section className="rounded-xl bg-[#F6F8F6] border border-[#E3E8E2] p-4">
              <h3 className="text-sm font-bold text-[#10442F] mb-2">
                التفويحة والبهارات (باش تجي بنينة)
              </h3>
              <p className="text-sm text-[#2D3E34] leading-relaxed">
                {recipe.spices.join(' · ')}
              </p>
            </section>

            {/* Interactive Step-by-step Preparation */}
            <section>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-base font-bold text-[#10442F] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#D97706]" />
                  كيفاش تطيّبها بالتفصيل
                </h3>
                <span className="text-[11px] text-[#64756B] tabular-nums">
                  {checkedSteps.length}/{recipe.steps.length} خطوات
                </span>
              </div>
              <ol className="space-y-2.5">
                {recipe.steps.map((step, idx) => {
                  const done = checkedSteps.includes(idx);
                  return (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => toggleStep(idx)}
                        className={`w-full text-right p-3 rounded-xl border flex items-start gap-3 text-sm leading-relaxed transition-colors ${
                          done
                            ? 'bg-[#F3F9F5] border-[#CFE5D6] text-[#5A6B61]'
                            : 'bg-white border-[#E3E8E2] text-[#1D2D24] hover:border-[#C5D3C9]'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 tabular-nums transition-colors ${
                            done
                              ? 'bg-[#146C4B] text-white'
                              : 'bg-[#EAF3EC] text-[#146C4B]'
                          }`}
                        >
                          {done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                        </span>
                        <span className={done ? 'line-through' : ''}>{step}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* Flavor Secret + FitTounsi Tip */}
            <div className="space-y-3">
              <section className="rounded-xl bg-[#EAF3EC] border border-[#CFE5D6] p-4">
                <div className="text-xs font-bold text-[#10442F] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#146C4B]" />
                  سرّ البنة التونسية
                </div>
                <p className="text-sm leading-relaxed text-[#1D2D24]">{recipe.flavorSecret}</p>
              </section>

              <section className="rounded-xl bg-[#FDF7EB] border border-[#F3DFB8] p-4">
                <div className="text-xs font-bold text-[#9A5B13] mb-1">نصيحة FitTounsi</div>
                <p className="text-sm leading-relaxed text-[#5C3D18]">{recipe.tip}</p>
              </section>
            </div>
          </div>
        </div>

        {/* Sticky footer actions */}
        <div className="p-4 border-t border-[#E3E8E2] bg-white flex items-center gap-3 shrink-0 pb-safe">
          {onOpenPicker && (
            <button
              type="button"
              onClick={() => onOpenPicker(recipe)}
              className="min-h-[46px] px-4 rounded-xl border border-[#D4DDD6] text-[#1D2D24] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#F6F7F4] transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              شوف بدائل أخرى
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onSelectForDay(recipe);
              onClose();
            }}
            className={`flex-1 min-h-[46px] px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
              isCurrentlySelected
                ? 'bg-[#EAF3EC] text-[#10442F]'
                : 'bg-[#146C4B] text-white hover:bg-[#10573C]'
            }`}
          >
            <Check className="w-4 h-4" />
            {isCurrentlySelected
              ? `مختارة لنهار ${activeDay}`
              : `اعتمدها لنهار ${activeDay}`}
          </button>
        </div>
      </div>
    </div>
  );
}
