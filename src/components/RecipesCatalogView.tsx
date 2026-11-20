import { useMemo, useState } from 'react';
import { BookOpen, Check, Clock, Search, X } from 'lucide-react';
import { CATEGORY_LABELS, RECIPES } from '../data/recipes';
import type { MealCategory, Recipe } from '../types';
import { SafeImage } from './SafeImage';

interface RecipesCatalogViewProps {
  activeDay: number;
  selectedRecipeIdsForDay: Set<string>;
  onOpenDetail: (recipe: Recipe) => void;
  onAssignToDay: (recipe: Recipe) => void;
}

type CategoryFilter = 'all' | MealCategory;
type QuickFilter = 'all' | 'highProtein' | 'budget' | 'quick';

export function RecipesCatalogView({
  activeDay,
  selectedRecipeIdsForDay,
  onOpenDetail,
  onAssignToDay,
}: RecipesCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [justAssignedId, setJustAssignedId] = useState<string | null>(null);

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return RECIPES.filter((r) => {
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
      if (quickFilter === 'highProtein' && r.protein < 30) return false;
      if (quickFilter === 'budget' && r.costDT > 2.5) return false;
      if (quickFilter === 'quick' && r.prepMinutes > 15) return false;
      if (q) {
        const hay = `${r.title} ${r.subtitle} ${r.ingredients.map((i) => i.name).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [searchQuery, categoryFilter, quickFilter]);

  const handleAssign = (recipe: Recipe) => {
    onAssignToDay(recipe);
    setJustAssignedId(recipe.id);
    window.setTimeout(() => {
      setJustAssignedId((prev) => (prev === recipe.id ? null : prev));
    }, 1800);
  };

  return (
    <div className="space-y-5">
      {/* Header & Search */}
      <section className="bg-white rounded-2xl border border-[#E3E8E2] p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#10442F]">
              مكتبة الوصفات التونسية ({RECIPES.length} وصفة)
            </h1>
            <p className="text-sm text-[#5A6B61]">
              ابحث، قارن السعرات والبروتين، وشوف طريقة التحضير بالتفصيل أو حط أي وصفة في نهار {activeDay}.
            </p>
          </div>
          <div className="text-xs font-medium text-[#64756B] tabular-nums">
            يعرض {filteredRecipes.length} من {RECIPES.length}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#64756B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="لوّج على وصفة أو مكوّن (دجاج، سردينة، عدس، شوفان...)"
            aria-label="بحث في الوصفات"
            className="w-full min-h-[46px] pr-10 pl-10 rounded-xl border border-[#DCE5DD] bg-[#F9FAF8] text-sm text-[#1D2D24] focus:outline-none focus:border-[#146C4B] focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="مسح البحث"
              className="absolute left-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-[#64756B] hover:text-[#1D2D24]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {(
            [
              ['all', 'الكل'],
              ['breakfast', 'فطور'],
              ['lunch', 'غداء'],
              ['dinner', 'عشاء'],
              ['snack', 'سناك'],
            ] as [CategoryFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategoryFilter(key)}
              className={`min-h-[42px] px-4 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
                categoryFilter === key
                  ? 'bg-[#146C4B] text-white'
                  : 'bg-[#F6F7F4] text-[#495A50] hover:bg-[#EAF3EC]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Secondary Goal Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-[#EEF2EE]">
          {(
            [
              ['all', 'كل الاختيارات'],
              ['highProtein', 'بروتين عالي (+30غ)'],
              ['budget', 'اقتصادية (≤ 2.5 دت)'],
              ['quick', 'سريعة (≤ 15 دق)'],
            ] as [QuickFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setQuickFilter(key)}
              className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 border ${
                quickFilter === key
                  ? 'border-[#146C4B] bg-[#EAF3EC] text-[#10442F]'
                  : 'border-[#E3E8E2] bg-white text-[#5A6B61] hover:bg-[#F6F7F4]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E3E8E2] p-10 text-center space-y-3">
          <p className="text-base font-bold text-[#1D2D24]">ما فمّاش وصفة تطابق البحث هذا</p>
          <p className="text-sm text-[#64756B]">جرّب تبدّل الفلتر أو تكتب مكوّن آخر.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setQuickFilter('all');
            }}
            className="min-h-[44px] px-5 rounded-xl bg-[#146C4B] text-white text-sm font-bold"
          >
            أظهر كل الوصفات
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {filteredRecipes.map((recipe) => {
            const isAssigned = selectedRecipeIdsForDay.has(recipe.id);
            const justAssigned = justAssignedId === recipe.id;
            const catMeta = CATEGORY_LABELS[recipe.category];

            return (
              <article
                key={recipe.id}
                className="bg-white rounded-2xl border border-[#E3E8E2] overflow-hidden flex flex-col shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => onOpenDetail(recipe)}
                  className="relative aspect-[4/3] w-full bg-[#EAF3EC] block group overflow-hidden text-right"
                >
                  <SafeImage
                    imageKey={recipe.imageKey}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute bottom-3 right-3.5 left-3.5 flex items-center justify-between text-white text-xs">
                    <span className="font-medium">{catMeta.short}</span>
                    <span className="flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      {recipe.prepMinutes} دق
                    </span>
                  </div>
                </button>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3.5">
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(recipe)}
                      className="text-right w-full group"
                    >
                      <h3 className="text-base font-bold text-[#1D2D24] group-hover:text-[#146C4B] transition-colors">
                        {recipe.title}
                      </h3>
                    </button>
                    <p className="text-xs sm:text-sm text-[#5A6B61] line-clamp-2 leading-relaxed">
                      {recipe.subtitle}
                    </p>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs pt-1.5 tabular-nums">
                      <span className="font-bold text-[#1D2D24]">{recipe.calories} kcal</span>
                      <span className="text-[#B8C4BC]" aria-hidden="true">·</span>
                      <span className="font-bold text-[#146C4B]">{recipe.protein}غ بروتين</span>
                      <span className="text-[#B8C4BC]" aria-hidden="true">·</span>
                      <span className="font-semibold text-[#9A5B13]">{recipe.costDT.toFixed(1)} دت</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EEF2EE]">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(recipe)}
                      className="min-h-[44px] px-2.5 rounded-xl bg-[#F6F7F4] text-[#1D2D24] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#EAF3EC] transition-colors whitespace-nowrap"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#146C4B]" />
                      التفاصيل
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAssign(recipe)}
                      className={`min-h-[44px] px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                        isAssigned || justAssigned
                          ? 'bg-[#EAF3EC] text-[#10442F]'
                          : 'bg-[#146C4B] text-white hover:bg-[#10573C]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {justAssigned
                        ? `تزاد لنهار ${activeDay}`
                        : isAssigned
                          ? `موجودة نهار ${activeDay}`
                          : `حطّها نهار ${activeDay}`}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
