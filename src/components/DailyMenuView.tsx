import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { CATEGORY_LABELS } from '../data/recipes';
import type { MealCategory, Recipe, UserProfile } from '../types';
import { SafeImage } from './SafeImage';

interface DailyMenuViewProps {
  activeDay: number;
  doneDays: number[];
  profile: UserProfile;
  mealsForDay: Record<MealCategory, Recipe>;
  onSelectDay: (day: number) => void;
  onToggleDone: (day: number) => void;
  onOpenDetail: (recipe: Recipe) => void;
  onOpenPicker: (category: MealCategory) => void;
  onNavigateTab: (tab: 'recipes' | 'shopping' | 'tracker') => void;
}

const CATEGORIES_ORDER: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export function DailyMenuView({
  activeDay,
  doneDays,
  profile,
  mealsForDay,
  onSelectDay,
  onToggleDone,
  onOpenDetail,
  onOpenPicker,
  onNavigateTab,
}: DailyMenuViewProps) {
  const [showAllDaysGrid, setShowAllDaysGrid] = useState(false);
  const dayButtonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  useEffect(() => {
    const activeBtn = dayButtonRefs.current[activeDay];
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeDay]);

  const isDayDone = doneDays.includes(activeDay);
  const progressPct = Math.round((doneDays.length / 30) * 100);

  const dayTotals = CATEGORIES_ORDER.reduce(
    (acc, cat) => {
      const r = mealsForDay[cat];
      return {
        calories: acc.calories + r.calories,
        protein: acc.protein + r.protein,
        carbs: acc.carbs + r.carbs,
        fats: acc.fats + r.fats,
        cost: acc.cost + r.costDT,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0, cost: 0 },
  );

  // SVG progress ring geometry
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (doneDays.length / 30) * circumference;

  return (
    <div className="space-y-6">
      {/* Challenge Overview & Daily Totals */}
      <section className="rounded-2xl bg-gradient-to-bl from-[#10442F] via-[#145B3F] to-[#1A7451] text-white p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-medium text-[#CFE8D7]">
              برنامج 30 يوم · أكل تونسي صحي ومتوازن
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight [text-wrap:balance]">
              تحدّي 30 يوم باش تولّي أقوى وأخفّ
            </h1>
            <p className="text-sm sm:text-[15px] text-[#E0EFE5] leading-relaxed">
              كل نهار فيه 4 وجبات مفصّلة بالمقادير وطريقة التحضير. بدّل أي وجبة على ذوقك وشوف السعرات والتكلفة تتحسب وحدها.
            </p>
          </div>

          {/* Progress Ring Card */}
          <div className="flex items-center gap-4 bg-white/10 rounded-2xl px-4 py-3.5 shrink-0 backdrop-blur-xs border border-white/10">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="5"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  fill="none"
                  stroke="#F4A340"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-[stroke-dashoffset] duration-300"
                />
              </svg>
              <span className="absolute text-sm font-bold tabular-nums">{progressPct}%</span>
            </div>
            <div>
              <div className="text-xs text-[#D5E9DC]">التقدّم العام</div>
              <div className="text-lg font-bold tabular-nums">
                {doneDays.length} من 30 نهار
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('tracker')}
                className="text-xs text-[#FAD59C] hover:text-white underline underline-offset-4 mt-0.5 transition-colors"
              >
                وزنك: {profile.currentWeight} كغ · الهدف {profile.targetWeight} كغ
              </button>
            </div>
          </div>
        </div>

        {/* 4-column Live Daily Nutrition & Budget Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
          <div>
            <div className="text-xs text-[#CFE8D7]">سعرات نهار {activeDay}</div>
            <div className="text-xl sm:text-2xl font-bold tabular-nums mt-0.5">
              {dayTotals.calories} <span className="text-xs font-normal opacity-80">kcal</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-[#CFE8D7]">مجموع البروتين</div>
            <div className="text-xl sm:text-2xl font-bold tabular-nums mt-0.5">
              {dayTotals.protein} <span className="text-xs font-normal opacity-80">غرام</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-[#CFE8D7]">التكلفة اليومية</div>
            <div className="text-xl sm:text-2xl font-bold tabular-nums mt-0.5">
              {dayTotals.cost.toFixed(1)}{' '}
              <span className="text-xs font-normal opacity-80">دينار</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-[#CFE8D7]">توازن الماكروز</div>
            <div className="text-sm sm:text-base font-semibold tabular-nums mt-1.5">
              {dayTotals.carbs}غ كارب · {dayTotals.fats}غ دهون
            </div>
          </div>
        </div>
      </section>

      {/* Day Selector (Mobile-friendly horizontal thumb scroller + optional 30-day grid) */}
      <section className="bg-white rounded-2xl border border-[#E3E8E2] p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#10442F]">
              برنامج نهار {activeDay}
            </h2>
            {isDayDone && (
              <span className="text-xs font-semibold text-[#146C4B]">· مكتمل ✓</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAllDaysGrid((prev) => !prev)}
            className="min-h-[40px] px-3 rounded-xl border border-[#E3E8E2] text-xs font-semibold text-[#1D2D24] flex items-center gap-1.5 hover:bg-[#F6F7F4] transition-colors whitespace-nowrap"
          >
            <CalendarDays className="w-4 h-4 text-[#146C4B]" />
            {showAllDaysGrid ? 'إخفاء الجدول' : 'كل الأيام (1–30)'}
          </button>
        </div>

        {/* Horizontal snap scroller for fast thumb switching */}
        {!showAllDaysGrid ? (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 snap-x">
            {Array.from({ length: 30 }, (_, idx) => idx + 1).map((d) => {
              const active = d === activeDay;
              const done = doneDays.includes(d);
              return (
                <button
                  key={d}
                  ref={(el) => {
                    dayButtonRefs.current[d] = el;
                  }}
                  type="button"
                  onClick={() => onSelectDay(d)}
                  className={`snap-center min-w-[54px] min-h-[54px] px-2.5 py-2 rounded-xl flex flex-col items-center justify-center shrink-0 transition-colors border ${
                    active
                      ? 'bg-[#146C4B] text-white border-[#146C4B] shadow-xs'
                      : done
                        ? 'bg-[#EAF3EC] text-[#10442F] border-[#B8D8C2]'
                        : 'bg-[#F6F7F4] text-[#2D3E34] border-transparent hover:border-[#D4DDD6]'
                  }`}
                >
                  <span className="text-[10px] opacity-80">نهار</span>
                  <span className="text-sm font-bold tabular-nums leading-tight">{d}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 pt-1">
            {Array.from({ length: 30 }, (_, idx) => idx + 1).map((d) => {
              const active = d === activeDay;
              const done = doneDays.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    onSelectDay(d);
                    setShowAllDaysGrid(false);
                  }}
                  className={`min-h-[44px] rounded-xl text-sm font-bold tabular-nums transition-colors border ${
                    active
                      ? 'bg-[#146C4B] text-white border-[#146C4B]'
                      : done
                        ? 'bg-[#EAF3EC] text-[#10442F] border-[#B8D8C2]'
                        : 'bg-[#F6F7F4] text-[#2D3E34] border-transparent hover:border-[#D4DDD6]'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        )}

        {/* Day navigation & Done Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#EEF2EE]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={activeDay <= 1}
              onClick={() => onSelectDay(activeDay - 1)}
              className="min-h-[44px] px-3.5 rounded-xl border border-[#E3E8E2] text-sm font-semibold text-[#1D2D24] flex items-center gap-1 disabled:opacity-40 hover:bg-[#F6F7F4] transition-colors whitespace-nowrap"
            >
              <ChevronRight className="w-4 h-4" />
              اللي قبل
            </button>
            <button
              type="button"
              disabled={activeDay >= 30}
              onClick={() => onSelectDay(activeDay + 1)}
              className="min-h-[44px] px-3.5 rounded-xl border border-[#E3E8E2] text-sm font-semibold text-[#1D2D24] flex items-center gap-1 disabled:opacity-40 hover:bg-[#F6F7F4] transition-colors whitespace-nowrap"
            >
              اللي بعد
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onToggleDone(activeDay)}
            className={`min-h-[44px] px-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
              isDayDone
                ? 'bg-[#EAF3EC] text-[#10442F] border border-[#146C4B]/30'
                : 'bg-[#146C4B] text-white hover:bg-[#10573C]'
            }`}
          >
            <Check className="w-4 h-4" />
            {isDayDone ? `كمّلت نهار ${activeDay} (إلغاء)` : `كمّلت نهار ${activeDay}`}
          </button>
        </div>
      </section>

      {/* Weight Note */}
      <div className="rounded-xl bg-[#FDF7EB] border border-[#F3DFB8] px-4 py-3 text-xs sm:text-sm text-[#5C3D18] leading-relaxed">
        ملاحظة الميزان: أوزان الروز، المقرونة، الكسكسي والعدس محسوبة <strong>بعد الطياب</strong>، والكميات تقريبية تنجم تبدّل الوصفات في أي وقت.
      </div>

      {/* 4 Meal Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {CATEGORIES_ORDER.map((category) => {
          const recipe = mealsForDay[category];
          const meta = CATEGORY_LABELS[category];

          return (
            <article
              key={category}
              className="bg-white rounded-2xl border border-[#E3E8E2] overflow-hidden flex flex-col shadow-xs"
            >
              {/* Clickable Photo Header */}
              <button
                type="button"
                onClick={() => onOpenDetail(recipe)}
                className="relative aspect-[4/3] w-full bg-[#EAF3EC] text-right group overflow-hidden block"
              >
                <SafeImage
                  imageKey={recipe.imageKey}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-3 right-4 left-4 flex items-end justify-between text-white">
                  <div>
                    <div className="text-xs font-medium text-white/90">
                      {meta.title} · {meta.window}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-white/95 tabular-nums">
                    <Clock className="w-3.5 h-3.5" />
                    {recipe.prepMinutes} دق
                  </div>
                </div>
              </button>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenDetail(recipe)}
                    className="text-right w-full group"
                  >
                    <h3 className="text-lg font-bold text-[#1D2D24] group-hover:text-[#146C4B] transition-colors">
                      {recipe.title}
                    </h3>
                  </button>
                  <p className="text-sm text-[#5A6B61] leading-relaxed">
                    {recipe.subtitle}
                  </p>

                  {/* Unboxed Macro Metadata Row */}
                  <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-xs sm:text-sm pt-1 tabular-nums">
                    <span className="font-bold text-[#1D2D24]">{recipe.calories} kcal</span>
                    <span className="text-[#B8C4BC]" aria-hidden="true">·</span>
                    <span className="font-bold text-[#146C4B]">{recipe.protein}غ بروتين</span>
                    <span className="text-[#B8C4BC]" aria-hidden="true">·</span>
                    <span className="text-[#5A6B61]">{recipe.carbs}غ كارب</span>
                    <span className="text-[#B8C4BC]" aria-hidden="true">·</span>
                    <span className="font-semibold text-[#9A5B13]">{recipe.costDT.toFixed(1)} دينار</span>
                  </div>

                  {/* Quick Ingredients Preview */}
                  <div className="pt-2 border-t border-[#EEF2EE] text-xs text-[#5A6B61] leading-relaxed">
                    <span className="font-semibold text-[#1D2D24]">المكوّنات: </span>
                    {recipe.ingredients
                      .slice(0, 3)
                      .map((ing) => `${ing.name} (${ing.amount})`)
                      .join('، ')}
                    {recipe.ingredients.length > 3 ? `، +${recipe.ingredients.length - 3} أخرى` : ''}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenDetail(recipe)}
                    className="min-h-[44px] px-3 rounded-xl bg-[#EAF3EC] text-[#10442F] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-[#DCECE0] transition-colors whitespace-nowrap"
                  >
                    <BookOpen className="w-4 h-4" />
                    التفاصيل والتحضير
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenPicker(category)}
                    className="min-h-[44px] px-3 rounded-xl border border-[#D4DDD6] bg-white text-[#1D2D24] text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-[#F6F7F4] transition-colors whitespace-nowrap"
                  >
                    <RefreshCw className="w-4 h-4 text-[#146C4B]" />
                    بدّل الوصفة
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Contextual shortcut to all recipes & shopping */}
      <section className="bg-white rounded-2xl border border-[#E3E8E2] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#1D2D24]">تحب خيارات أكثر أو تحضّر قضيتك؟</h3>
          <p className="text-sm text-[#5A6B61]">
            عندك 32 وصفة تونسية مفصّلة وقائمة شرا أسبوعية جاهزة بالدينار.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onNavigateTab('recipes')}
            className="flex-1 sm:flex-none min-h-[44px] px-4 rounded-xl bg-[#146C4B] text-white text-sm font-bold hover:bg-[#10573C] transition-colors whitespace-nowrap"
          >
            تصفّح كل الوصفات
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('shopping')}
            className="flex-1 sm:flex-none min-h-[44px] px-4 rounded-xl border border-[#D4DDD6] text-sm font-semibold text-[#1D2D24] hover:bg-[#F6F7F4] transition-colors whitespace-nowrap"
          >
            قائمة الشرا
          </button>
        </div>
      </section>
    </div>
  );
}
