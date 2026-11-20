import type { AppState, CustomShoppingItem, ShoppingItemState, TrackerEntry, UserProfile } from '../types';

const STORAGE_KEY = 'fittounsi_app_state_v2';
const BACKUP_KEY = 'fittounsi_app_state_backup_v2';
export const CURRENT_SCHEMA_VERSION = 2;

export const DEFAULT_PROFILE: UserProfile = {
  currentWeight: 76,
  heightCm: 170,
  targetWeight: 72,
  dailyBudgetDT: 10,
};

export function createDefaultState(): AppState {
  return {
    version: CURRENT_SCHEMA_VERSION,
    activeDay: 1,
    doneDays: [],
    selectedRecipes: {},
    shoppingState: {},
    customShoppingItems: [],
    dailyHabits: {},
    profile: { ...DEFAULT_PROFILE },
    trackerHistory: [
      {
        id: 'initial-entry',
        dateISO: new Date().toISOString().slice(0, 10),
        weight: DEFAULT_PROFILE.currentWeight,
        note: 'بداية التحدّي',
      },
    ],
    lastUpdatedISO: new Date().toISOString(),
  };
}

/** Strict numeric bounds & parsing helpers */
export function clampNumber(value: number, min: number, max: number, decimals = 1): number {
  if (!Number.isFinite(value)) return min;
  const clamped = Math.min(max, Math.max(min, value));
  const factor = Math.pow(10, decimals);
  return Math.round(clamped * factor) / factor;
}

export interface ValidationResult {
  valid: boolean;
  value?: number;
  error?: string;
}

export function validateNumericInput(
  raw: string,
  options: {
    label: string;
    min: number;
    max: number;
    required?: boolean;
    decimals?: number;
  },
): ValidationResult {
  const trimmed = raw.trim().replace(',', '.');
  if (!trimmed) {
    if (options.required) {
      return { valid: false, error: `رجاءً اكتب ${options.label}.` };
    }
    return { valid: true, value: undefined };
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return { valid: false, error: `${options.label} لازم يكون رقم صحيح.` };
  }
  if (parsed < options.min || parsed > options.max) {
    return {
      valid: false,
      error: `${options.label} لازم يكون بين ${options.min} و ${options.max}.`,
    };
  }
  const factor = Math.pow(10, options.decimals ?? 1);
  return { valid: true, value: Math.round(parsed * factor) / factor };
}

/** Migrate legacy keys from the original HTML prototype if present */
function migrateLegacyState(base: AppState): AppState {
  if (typeof window === 'undefined') return base;
  try {
    const legacyDone = window.localStorage.getItem('ftDone');
    if (legacyDone) {
      const parsed = JSON.parse(legacyDone);
      if (Array.isArray(parsed)) {
        base.doneDays = parsed
          .map(Number)
          .filter((d) => Number.isInteger(d) && d >= 1 && d <= 30);
      }
    }

    const legacyTracker = window.localStorage.getItem('ftTracker');
    if (legacyTracker) {
      const parsed = JSON.parse(legacyTracker) as { weight?: unknown; waist?: unknown; date?: string };
      const weight = Number(parsed?.weight);
      const waist = parsed?.waist ? Number(parsed.waist) : undefined;
      if (Number.isFinite(weight) && weight >= 30 && weight <= 250) {
        base.profile.currentWeight = clampNumber(weight, 30, 250, 1);
        base.trackerHistory = [
          {
            id: 'migrated-tracker',
            dateISO: new Date().toISOString().slice(0, 10),
            weight: base.profile.currentWeight,
            waist: waist && Number.isFinite(waist) && waist >= 45 && waist <= 180 ? waist : undefined,
            note: 'بيانات منقولـة من النسخة السابقة',
          },
        ];
      }
    }

    // Legacy shopping keys: ftShop-{w}-{i} and ftShop-{w}-{i}-price
    for (let w = 0; w < 4; w++) {
      for (let i = 0; i < 20; i++) {
        const legacyKey = `ftShop-${w}-${i}`;
        const checkedRaw = window.localStorage.getItem(legacyKey);
        const priceRaw = window.localStorage.getItem(`${legacyKey}-price`);
        if (checkedRaw !== null || priceRaw !== null) {
          const itemKey = `${w}-w${w}-${i}`;
          const parsedPrice = priceRaw !== null ? Number(priceRaw) : NaN;
          base.shoppingState[itemKey] = {
            checked: checkedRaw === 'true',
            price: Number.isFinite(parsedPrice) && parsedPrice >= 0 ? clampNumber(parsedPrice, 0, 500, 2) : 0,
          };
        }
      }
    }
  } catch {
    // Ignore malformed legacy values safely
  }
  return base;
}

function sanitizeState(raw: unknown): AppState {
  const defaults = createDefaultState();
  if (!raw || typeof raw !== 'object') return defaults;
  const obj = raw as Partial<AppState>;

  const activeDay =
    typeof obj.activeDay === 'number' && Number.isInteger(obj.activeDay)
      ? Math.min(30, Math.max(1, obj.activeDay))
      : 1;

  const doneDays = Array.isArray(obj.doneDays)
    ? Array.from(
        new Set(
          obj.doneDays
            .map(Number)
            .filter((d) => Number.isInteger(d) && d >= 1 && d <= 30),
        ),
      ).sort((a, b) => a - b)
    : [];

  const selectedRecipes: Record<string, string> = {};
  if (obj.selectedRecipes && typeof obj.selectedRecipes === 'object') {
    for (const [k, v] of Object.entries(obj.selectedRecipes)) {
      if (typeof v === 'string' && v.trim()) {
        selectedRecipes[k] = v;
      }
    }
  }

  const shoppingState: Record<string, ShoppingItemState> = {};
  if (obj.shoppingState && typeof obj.shoppingState === 'object') {
    for (const [k, v] of Object.entries(obj.shoppingState)) {
      if (v && typeof v === 'object') {
        const item = v as Partial<ShoppingItemState>;
        shoppingState[k] = {
          checked: Boolean(item.checked),
          price:
            typeof item.price === 'number' && Number.isFinite(item.price)
              ? clampNumber(item.price, 0, 500, 2)
              : 0,
        };
      }
    }
  }

  const customShoppingItems: CustomShoppingItem[] = Array.isArray(obj.customShoppingItems)
    ? obj.customShoppingItems
        .filter((c): c is CustomShoppingItem => Boolean(c && typeof c.id === 'string' && typeof c.name === 'string'))
        .map((c) => ({
          id: c.id,
          weekIndex: Math.min(3, Math.max(0, Number(c.weekIndex) || 0)),
          name: c.name.trim().slice(0, 60),
          quantity: (c.quantity || '1').trim().slice(0, 30),
          price: clampNumber(Number(c.price) || 0, 0, 500, 2),
          checked: Boolean(c.checked),
        }))
    : [];

  const profile: UserProfile = {
    currentWeight: clampNumber(Number(obj.profile?.currentWeight) || DEFAULT_PROFILE.currentWeight, 30, 250, 1),
    heightCm: clampNumber(Number(obj.profile?.heightCm) || DEFAULT_PROFILE.heightCm, 120, 230, 0),
    targetWeight: clampNumber(Number(obj.profile?.targetWeight) || DEFAULT_PROFILE.targetWeight, 30, 250, 1),
    dailyBudgetDT: clampNumber(Number(obj.profile?.dailyBudgetDT) || DEFAULT_PROFILE.dailyBudgetDT, 3, 100, 1),
  };

  const trackerHistory: TrackerEntry[] = Array.isArray(obj.trackerHistory) && obj.trackerHistory.length > 0
    ? obj.trackerHistory
        .filter((e): e is TrackerEntry => Boolean(e && typeof e.id === 'string' && typeof e.weight === 'number'))
        .map((e) => ({
          id: e.id,
          dateISO: typeof e.dateISO === 'string' ? e.dateISO.slice(0, 10) : new Date().toISOString().slice(0, 10),
          weight: clampNumber(e.weight, 30, 250, 1),
          waist:
            typeof e.waist === 'number' && Number.isFinite(e.waist)
              ? clampNumber(e.waist, 45, 180, 1)
              : undefined,
          note: typeof e.note === 'string' ? e.note.slice(0, 120) : undefined,
        }))
    : defaults.trackerHistory;

  const dailyHabits: AppState['dailyHabits'] = {};
  if (obj.dailyHabits && typeof obj.dailyHabits === 'object') {
    for (const [k, v] of Object.entries(obj.dailyHabits)) {
      if (v && typeof v === 'object') {
        dailyHabits[k] = {
          water: Boolean(v.water),
          workout: Boolean(v.workout),
          sleep: Boolean(v.sleep),
        };
      }
    }
  }

  return {
    version: CURRENT_SCHEMA_VERSION,
    activeDay,
    doneDays,
    selectedRecipes,
    shoppingState,
    customShoppingItems,
    dailyHabits,
    profile,
    trackerHistory,
    lastUpdatedISO: typeof obj.lastUpdatedISO === 'string' ? obj.lastUpdatedISO : new Date().toISOString(),
  };
}

export function loadAppState(): AppState {
  if (typeof window === 'undefined') return createDefaultState();

  for (const key of [STORAGE_KEY, BACKUP_KEY]) {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return sanitizeState(parsed);
      }
    } catch {
      // Fallback to backup or legacy migration
    }
  }

  const migrated = migrateLegacyState(createDefaultState());
  saveAppStateImmediate(migrated);
  return migrated;
}

export function saveAppStateImmediate(state: AppState): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const payload = JSON.stringify({
      ...state,
      version: CURRENT_SCHEMA_VERSION,
      lastUpdatedISO: new Date().toISOString(),
    });
    window.localStorage.setItem(STORAGE_KEY, payload);
    window.localStorage.setItem(BACKUP_KEY, payload);
    return true;
  } catch {
    return false;
  }
}

export function parseImportedState(jsonText: string): AppState | null {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') return null;
    return sanitizeState(parsed);
  } catch {
    return null;
  }
}

export { STORAGE_KEY };
