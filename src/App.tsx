import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Check,
  ShoppingCart,
  Utensils,
} from 'lucide-react';
import { DailyMenuView } from './components/DailyMenuView';
import { RecipeDetailSheet } from './components/RecipeDetailSheet';
import { RecipePickerSheet } from './components/RecipePickerSheet';
import { RecipesCatalogView } from './components/RecipesCatalogView';
import { ShoppingListView } from './components/ShoppingListView';
import { TrackerView } from './components/TrackerView';
import { getDefaultRecipeForDay, RECIPE_MAP } from './data/recipes';
import type {
  ActiveTab,
  AppState,
  DailyHabits,
  MealCategory,
  Recipe,
} from './types';
import {
  loadAppState,
  parseImportedState,
  saveAppStateImmediate,
  STORAGE_KEY,
} from './utils/storage';

const NAV_ITEMS: { id: ActiveTab; label: string; Icon: typeof Utensils }[] = [
  { id: 'menu', label: 'البرنامج', Icon: Utensils },
  { id: 'recipes', label: 'الوصفات', Icon: BookOpen },
  { id: 'shopping', label: 'الشرا', Icon: ShoppingCart },
  { id: 'tracker', label: 'التقدّم', Icon: BarChart3 },
];

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('menu');
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [pickerCategory, setPickerCategory] = useState<MealCategory | null>(null);

  const latestStateRef = useRef(state);
  latestStateRef.current = state;

  // Debounced localStorage sync + guaranteed flush on page hide/unload
  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveAppStateImmediate(state);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    const flush = () => {
      saveAppStateImmediate(latestStateRef.current);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    const onStorageSync = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const synced = parseImportedState(e.newValue);
        if (synced) setState(synced);
      }
    };

    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('storage', onStorageSync);

    return () => {
      flush();
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('storage', onStorageSync);
    };
  }, []);

  const switchTab = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const mealsForDay = useMemo((): Record<MealCategory, Recipe> => {
    const categories: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack'];
    const result = {} as Record<MealCategory, Recipe>;
    for (const cat of categories) {
      const overrideId = state.selectedRecipes[`${state.activeDay}-${cat}`];
      const found = overrideId ? RECIPE_MAP[overrideId] : undefined;
      result[cat] =
        found && found.category === cat
          ? found
          : getDefaultRecipeForDay(state.activeDay, cat);
    }
    return result;
  }, [state.activeDay, state.selectedRecipes]);

  const selectedIdsSet = useMemo(
    () => new Set(Object.values(mealsForDay).map((r) => r.id)),
    [mealsForDay],
  );

  const handleSelectDay = useCallback((day: number) => {
    const clamped = Math.min(30, Math.max(1, day));
    setState((prev) => ({ ...prev, activeDay: clamped }));
  }, []);

  const handleToggleDone = useCallback((day: number) => {
    setState((prev) => {
      const exists = prev.doneDays.includes(day);
      const doneDays = exists
        ? prev.doneDays.filter((d) => d !== day)
        : [...prev.doneDays, day].sort((a, b) => a - b);
      return { ...prev, doneDays };
    });
  }, []);

  const handleAssignRecipe = useCallback((recipe: Recipe) => {
    setState((prev) => ({
      ...prev,
      selectedRecipes: {
        ...prev.selectedRecipes,
        [`${prev.activeDay}-${recipe.category}`]: recipe.id,
      },
    }));
  }, []);

  const handleToggleShoppingItem = useCallback(
    (weekIndex: number, itemId: string, defaultPrice: number) => {
      const key = `${weekIndex}-${itemId}`;
      setState((prev) => {
        const existing = prev.shoppingState[key];
        const nextChecked = !(existing?.checked ?? false);
        const price = existing ? existing.price : defaultPrice;
        return {
          ...prev,
          shoppingState: {
            ...prev.shoppingState,
            [key]: { checked: nextChecked, price },
          },
        };
      });
    },
    [],
  );

  const handleUpdateShoppingPrice = useCallback(
    (weekIndex: number, itemId: string, price: number) => {
      const key = `${weekIndex}-${itemId}`;
      setState((prev) => {
        const existing = prev.shoppingState[key];
        return {
          ...prev,
          shoppingState: {
            ...prev.shoppingState,
            [key]: { checked: existing?.checked ?? false, price },
          },
        };
      });
    },
    [],
  );

  const handleAddCustomShoppingItem = useCallback(
    (weekIndex: number, name: string, quantity: string, price: number) => {
      setState((prev) => ({
        ...prev,
        customShoppingItems: [
          ...prev.customShoppingItems,
          {
            id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            weekIndex,
            name,
            quantity,
            price,
            checked: false,
          },
        ],
      }));
    },
    [],
  );

  const handleToggleCustomItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      customShoppingItems: prev.customShoppingItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    }));
  }, []);

  const handleUpdateCustomPrice = useCallback((id: string, price: number) => {
    setState((prev) => ({
      ...prev,
      customShoppingItems: prev.customShoppingItems.map((item) =>
        item.id === id ? { ...item, price } : item,
      ),
    }));
  }, []);

  const handleDeleteCustomItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      customShoppingItems: prev.customShoppingItems.filter((item) => item.id !== id),
    }));
  }, []);

  const handleResetWeek = useCallback((weekIndex: number) => {
    setState((prev) => {
      const nextShopping = { ...prev.shoppingState };
      for (const key of Object.keys(nextShopping)) {
        if (key.startsWith(`${weekIndex}-`)) {
          delete nextShopping[key];
        }
      }
      return {
        ...prev,
        shoppingState: nextShopping,
        customShoppingItems: prev.customShoppingItems.filter((c) => c.weekIndex !== weekIndex),
      };
    });
  }, []);

  const handleSaveMeasurement = useCallback(
    (data: {
      weight: number;
      heightCm: number;
      targetWeight: number;
      waist?: number;
      note?: string;
    }) => {
      const todayISO = new Date().toISOString().slice(0, 10);
      setState((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          currentWeight: data.weight,
          heightCm: data.heightCm,
          targetWeight: data.targetWeight,
        },
        trackerHistory: [
          ...prev.trackerHistory,
          {
            id: `entry-${Date.now()}`,
            dateISO: todayISO,
            weight: data.weight,
            waist: data.waist,
            note: data.note,
          },
        ],
      }));
    },
    [],
  );

  const handleDeleteTrackerEntry = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      trackerHistory: prev.trackerHistory.filter((e) => e.id !== id),
    }));
  }, []);

  const handleToggleHabit = useCallback((day: number, habit: keyof DailyHabits) => {
    const key = String(day);
    setState((prev) => {
      const curr = prev.dailyHabits[key] ?? { water: false, workout: false, sleep: false };
      return {
        ...prev,
        dailyHabits: {
          ...prev.dailyHabits,
          [key]: { ...curr, [habit]: !curr[habit] },
        },
      };
    });
  }, []);

  const handleExportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(latestStateRef.current, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fittounsi-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImportJSON = useCallback((raw: string): boolean => {
    const parsed = parseImportedState(raw);
    if (!parsed) return false;
    setState(parsed);
    saveAppStateImmediate(parsed);
    return true;
  }, []);

  const isCurrentDayDone = state.doneDays.includes(state.activeDay);
  const currentDayHabits: DailyHabits = state.dailyHabits[String(state.activeDay)] ?? {
    water: false,
    workout: false,
    sleep: false,
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#F6F7F4] text-[#1D2D24]">
      {/* Sticky Header: 3-zone contract on desktop, compact bar on mobile */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E3E8E2] no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[52px] md:h-16 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => switchTab('menu')}
            className="text-lg md:text-xl font-extrabold tracking-tight text-[#10442F] whitespace-nowrap shrink-0"
          >
            FitTounsi 🇹🇳
          </button>

          {/* Zone 2: Desktop Single-Line Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold" aria-label="التنقل الرئيسي">
            {NAV_ITEMS.map(({ id, label }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => switchTab(id)}
                  className={`py-2 whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                    active
                      ? 'text-[#146C4B] border-[#146C4B]'
                      : 'text-[#5A6B61] border-transparent hover:text-[#1D2D24]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Center Contextual Label */}
          <span className="md:hidden text-xs font-bold text-[#495A50] truncate tabular-nums">
            نهار {state.activeDay} · {state.doneDays.length}/30
          </span>

          {/* Zone 3: Single Contextual Action */}
          <button
            type="button"
            onClick={() => handleToggleDone(state.activeDay)}
            className={`min-h-[38px] md:min-h-[42px] px-3 md:px-4 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
              isCurrentDayDone
                ? 'bg-[#EAF3EC] text-[#10442F]'
                : 'bg-[#146C4B] text-white hover:bg-[#10573C]'
            }`}
          >
            <Check className="w-4 h-4" />
            {isCurrentDayDone ? `نهار ${state.activeDay} ✓` : `كمّلت نهار ${state.activeDay}`}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7 pb-24 md:pb-10">
        {activeTab === 'menu' && (
          <DailyMenuView
            activeDay={state.activeDay}
            doneDays={state.doneDays}
            profile={state.profile}
            mealsForDay={mealsForDay}
            onSelectDay={handleSelectDay}
            onToggleDone={handleToggleDone}
            onOpenDetail={(r) => setDetailRecipe(r)}
            onOpenPicker={(cat) => setPickerCategory(cat)}
            onNavigateTab={switchTab}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipesCatalogView
            activeDay={state.activeDay}
            selectedRecipeIdsForDay={selectedIdsSet}
            onOpenDetail={(r) => setDetailRecipe(r)}
            onAssignToDay={handleAssignRecipe}
          />
        )}

        {activeTab === 'shopping' && (
          <ShoppingListView
            shoppingState={state.shoppingState}
            customItems={state.customShoppingItems}
            onToggleItem={handleToggleShoppingItem}
            onUpdatePrice={handleUpdateShoppingPrice}
            onAddCustomItem={handleAddCustomShoppingItem}
            onToggleCustomItem={handleToggleCustomItem}
            onUpdateCustomPrice={handleUpdateCustomPrice}
            onDeleteCustomItem={handleDeleteCustomItem}
            onResetWeek={handleResetWeek}
          />
        )}

        {activeTab === 'tracker' && (
          <TrackerView
            activeDay={state.activeDay}
            doneDaysCount={state.doneDays.length}
            profile={state.profile}
            habits={currentDayHabits}
            history={state.trackerHistory}
            lastUpdatedISO={state.lastUpdatedISO}
            onSaveMeasurement={handleSaveMeasurement}
            onDeleteEntry={handleDeleteTrackerEntry}
            onToggleHabit={handleToggleHabit}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
          />
        )}
      </main>

      {/* Quiet Footer (Desktop) */}
      <footer className="hidden md:block border-t border-[#E3E8E2] py-6 text-center text-xs text-[#64756B] no-print">
        FitTounsi 🇹🇳 · كول مليح، تمرّن مليح، واصبر على النتيجة
      </footer>

      {/* Mobile Fixed Bottom Navigation Bar (Natural Thumb Zone) */}
      <nav
        aria-label="التنقل السريع على الهاتف"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E3E8E2] pb-safe no-print"
      >
        <div className="grid grid-cols-4 h-16 items-center">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => switchTab(id)}
                className={`h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? 'text-[#146C4B]' : 'text-[#64756B]'
                }`}
              >
                <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.4 : 1.8} />
                <span className={`text-[11px] tracking-tight ${active ? 'font-bold' : 'font-medium'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Interactive Bottom Sheets / Modals */}
      <RecipeDetailSheet
        recipe={detailRecipe}
        activeDay={state.activeDay}
        isCurrentlySelected={detailRecipe ? selectedIdsSet.has(detailRecipe.id) : false}
        onClose={() => setDetailRecipe(null)}
        onSelectForDay={handleAssignRecipe}
        onOpenPicker={(recipe) => {
          setDetailRecipe(null);
          setPickerCategory(recipe.category);
        }}
      />

      <RecipePickerSheet
        category={pickerCategory}
        currentRecipeId={pickerCategory ? mealsForDay[pickerCategory].id : null}
        activeDay={state.activeDay}
        onClose={() => setPickerCategory(null)}
        onSelect={handleAssignRecipe}
        onOpenDetail={(recipe) => {
          setPickerCategory(null);
          setDetailRecipe(recipe);
        }}
      />
    </div>
  );
}
