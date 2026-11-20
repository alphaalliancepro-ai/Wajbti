import { useMemo, useRef, useState } from 'react';
import {
  Activity,
  Check,
  Download,
  Droplets,
  Moon,
  Scale,
  Trash2,
  Upload,
} from 'lucide-react';
import type { DailyHabits, TrackerEntry, UserProfile } from '../types';
import { validateNumericInput } from '../utils/storage';

interface TrackerViewProps {
  activeDay: number;
  doneDaysCount: number;
  profile: UserProfile;
  habits: DailyHabits;
  history: TrackerEntry[];
  lastUpdatedISO: string;
  onSaveMeasurement: (data: {
    weight: number;
    heightCm: number;
    targetWeight: number;
    waist?: number;
    note?: string;
  }) => void;
  onDeleteEntry: (id: string) => void;
  onToggleHabit: (day: number, habit: keyof DailyHabits) => void;
  onExportJSON: () => void;
  onImportJSON: (raw: string) => boolean;
}

export function TrackerView({
  activeDay,
  doneDaysCount,
  profile,
  habits,
  history,
  lastUpdatedISO,
  onSaveMeasurement,
  onDeleteEntry,
  onToggleHabit,
  onExportJSON,
  onImportJSON,
}: TrackerViewProps) {
  const [weightInput, setWeightInput] = useState(String(profile.currentWeight));
  const [heightInput, setHeightInput] = useState(String(profile.heightCm));
  const [targetInput, setTargetInput] = useState(String(profile.targetWeight));
  const [waistInput, setWaistInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [importFeedback, setImportFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const bmi = useMemo(() => {
    const hMeters = profile.heightCm / 100;
    if (hMeters <= 0) return 0;
    return Math.round((profile.currentWeight / (hMeters * hMeters)) * 10) / 10;
  }, [profile.currentWeight, profile.heightCm]);

  const bmiLabel = useMemo(() => {
    if (bmi < 18.5) return 'نحافة خفيفة';
    if (bmi < 25) return 'وزن صحي مثالي';
    if (bmi < 30) return 'زيادة بسيطة في الوزن';
    return 'فوق المعدل الصحي';
  }, [bmi]);

  const deltaToTarget = Math.round((profile.currentWeight - profile.targetWeight) * 10) / 10;

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    [history],
  );

  // SVG Trend Chart points
  const chartPoints = useMemo(() => {
    if (sortedHistory.length === 0) return null;
    const weights = sortedHistory.map((e) => e.weight);
    const minW = Math.min(...weights, profile.targetWeight) - 1.5;
    const maxW = Math.max(...weights, profile.targetWeight) + 1.5;
    const range = Math.max(1, maxW - minW);

    const width = 560;
    const height = 160;
    const padX = 24;
    const padY = 20;

    const pts = sortedHistory.map((entry, idx) => {
      const x =
        sortedHistory.length === 1
          ? width / 2
          : padX + (idx / (sortedHistory.length - 1)) * (width - padX * 2);
      const y = height - padY - ((entry.weight - minW) / range) * (height - padY * 2);
      return { x, y, entry };
    });

    const targetY = height - padY - ((profile.targetWeight - minW) / range) * (height - padY * 2);

    return {
      width,
      height,
      pts,
      polyline: pts.map((p) => `${p.x},${p.y}`).join(' '),
      targetY,
    };
  }, [sortedHistory, profile.targetWeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    const wRes = validateNumericInput(weightInput, {
      label: 'الوزن الحالي',
      min: 30,
      max: 250,
      required: true,
      decimals: 1,
    });
    if (!wRes.valid) nextErrors.weight = wRes.error!;

    const hRes = validateNumericInput(heightInput, {
      label: 'الطول',
      min: 120,
      max: 230,
      required: true,
      decimals: 0,
    });
    if (!hRes.valid) nextErrors.height = hRes.error!;

    const tRes = validateNumericInput(targetInput, {
      label: 'الوزن الهدف',
      min: 30,
      max: 250,
      required: true,
      decimals: 1,
    });
    if (!tRes.valid) nextErrors.target = tRes.error!;

    const waistRes = validateNumericInput(waistInput, {
      label: 'محيط الكرش',
      min: 45,
      max: 180,
      required: false,
      decimals: 1,
    });
    if (!waistRes.valid) nextErrors.waist = waistRes.error!;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFeedback(null);
      return;
    }

    setErrors({});
    onSaveMeasurement({
      weight: wRes.value!,
      heightCm: hRes.value!,
      targetWeight: tRes.value!,
      waist: waistRes.value,
      note: noteInput.trim() || undefined,
    });
    setWaistInput('');
    setNoteInput('');
    setFeedback(`تم حفظ القياس الجديد (${wRes.value} كغ) بنجاح.`);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = onImportJSON(String(reader.result || ''));
      setImportFeedback(
        ok
          ? { ok: true, msg: 'تم استرجاع النسخة الاحتياطية بنجاح.' }
          : { ok: false, msg: 'الملف غير صالح أو تالف.' },
      );
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Top Body Metrics Summary */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-[#E3E8E2] p-4">
          <div className="text-xs text-[#64756B]">الوزن الحالي</div>
          <div className="text-2xl font-bold text-[#10442F] tabular-nums mt-1">
            {profile.currentWeight} <span className="text-xs font-medium">كغ</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E3E8E2] p-4">
          <div className="text-xs text-[#64756B]">الهدف</div>
          <div className="text-2xl font-bold text-[#146C4B] tabular-nums mt-1">
            {profile.targetWeight} <span className="text-xs font-medium">كغ</span>
          </div>
          <div className="text-[11px] text-[#64756B] mt-0.5 tabular-nums">
            {deltaToTarget === 0
              ? 'وصلت لهدفك'
              : deltaToTarget > 0
                ? `مازال ${deltaToTarget} كغ`
                : `أكثر بـ ${Math.abs(deltaToTarget)} كغ`}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E3E8E2] p-4">
          <div className="text-xs text-[#64756B]">مؤشر الكتلة (BMI)</div>
          <div className="text-2xl font-bold text-[#1D2D24] tabular-nums mt-1">{bmi}</div>
          <div className="text-[11px] text-[#146C4B] font-medium mt-0.5">{bmiLabel}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E3E8E2] p-4">
          <div className="text-xs text-[#64756B]">أيام الالتزام</div>
          <div className="text-2xl font-bold text-[#9A5B13] tabular-nums mt-1">
            {doneDaysCount} <span className="text-xs font-medium">/ 30</span>
          </div>
          <div className="text-[11px] text-[#64756B] mt-0.5">نهار التحدّي الحالي: {activeDay}</div>
        </div>
      </section>

      {/* Main 2-col layout: Measurement Form + Daily Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Measurement Form */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-[#E3E8E2] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#146C4B]" />
            <h2 className="text-lg font-bold text-[#10442F]">تسجيل القياسات والأهداف</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="weight-input" className="block text-xs font-semibold text-[#495A50] mb-1.5">
                  الوزن الحالي (كغ)
                </label>
                <input
                  id="weight-input"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className={`w-full min-h-[44px] px-3 rounded-xl border text-sm tabular-nums focus:outline-none ${
                    errors.weight ? 'border-[#B43C15] bg-[#FDF3EE]' : 'border-[#DCE5DD] focus:border-[#146C4B]'
                  }`}
                />
                {errors.weight && <p className="text-xs text-[#B43C15] mt-1">{errors.weight}</p>}
              </div>

              <div>
                <label htmlFor="height-input" className="block text-xs font-semibold text-[#495A50] mb-1.5">
                  الطول (سم)
                </label>
                <input
                  id="height-input"
                  type="number"
                  inputMode="numeric"
                  step="1"
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  className={`w-full min-h-[44px] px-3 rounded-xl border text-sm tabular-nums focus:outline-none ${
                    errors.height ? 'border-[#B43C15] bg-[#FDF3EE]' : 'border-[#DCE5DD] focus:border-[#146C4B]'
                  }`}
                />
                {errors.height && <p className="text-xs text-[#B43C15] mt-1">{errors.height}</p>}
              </div>

              <div>
                <label htmlFor="target-input" className="block text-xs font-semibold text-[#495A50] mb-1.5">
                  الوزن الهدف (كغ)
                </label>
                <input
                  id="target-input"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  className={`w-full min-h-[44px] px-3 rounded-xl border text-sm tabular-nums focus:outline-none ${
                    errors.target ? 'border-[#B43C15] bg-[#FDF3EE]' : 'border-[#DCE5DD] focus:border-[#146C4B]'
                  }`}
                />
                {errors.target && <p className="text-xs text-[#B43C15] mt-1">{errors.target}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="waist-input" className="block text-xs font-semibold text-[#495A50] mb-1.5">
                  محيط الكرش بالسم (اختياري)
                </label>
                <input
                  id="waist-input"
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  placeholder="مثلاً 90"
                  value={waistInput}
                  onChange={(e) => setWaistInput(e.target.value)}
                  className={`w-full min-h-[44px] px-3 rounded-xl border text-sm tabular-nums focus:outline-none ${
                    errors.waist ? 'border-[#B43C15] bg-[#FDF3EE]' : 'border-[#DCE5DD] focus:border-[#146C4B]'
                  }`}
                />
                {errors.waist && <p className="text-xs text-[#B43C15] mt-1">{errors.waist}</p>}
              </div>

              <div>
                <label htmlFor="note-input" className="block text-xs font-semibold text-[#495A50] mb-1.5">
                  ملاحظة سريعة (اختياري)
                </label>
                <input
                  id="note-input"
                  type="text"
                  maxLength={100}
                  placeholder="مثلاً: بعد الأسبوع الأول"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-[#DCE5DD] text-sm focus:outline-none focus:border-[#146C4B]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
              <button
                type="submit"
                className="min-h-[46px] px-6 rounded-xl bg-[#146C4B] text-white text-sm font-bold hover:bg-[#10573C] transition-colors"
              >
                احفظ التقدّم
              </button>
              {feedback && (
                <span className="text-sm font-semibold text-[#146C4B]" role="status">
                  {feedback}
                </span>
              )}
            </div>
          </form>
        </section>

        {/* Daily Habits Check-in for Active Day */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-[#E3E8E2] p-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#10442F]">عادات نهار {activeDay}</h2>
            <p className="text-xs text-[#64756B]">
              النجاح في التحدّي يعتمد على الأكل + الماء + الحركة + النوم.
            </p>
          </div>

          <div className="space-y-2.5">
            {(
              [
                {
                  key: 'water' as const,
                  title: 'شرب 2.5 لتر ماء',
                  sub: 'يرفع الحرق وينقّص التعب',
                  Icon: Droplets,
                },
                {
                  key: 'workout' as const,
                  title: 'رياضة أو مشي 30 دقيقة',
                  sub: 'كارديو خفيف أو تمارين مقاومة في الدار',
                  Icon: Activity,
                },
                {
                  key: 'sleep' as const,
                  title: 'نوم 7 إلى 8 ساعات',
                  sub: 'أساسي لاستشفاء العضلات',
                  Icon: Moon,
                },
              ]
            ).map(({ key, title, sub, Icon }) => {
              const active = habits[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onToggleHabit(activeDay, key)}
                  aria-pressed={active}
                  className={`w-full min-h-[60px] p-3.5 rounded-xl border flex items-center gap-3 text-right transition-colors ${
                    active
                      ? 'border-[#146C4B] bg-[#F3F9F5]'
                      : 'border-[#E3E8E2] bg-white hover:bg-[#F9FAF8]'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      active ? 'bg-[#146C4B] text-white' : 'bg-[#F6F7F4] text-[#495A50]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-[#1D2D24]">{title}</div>
                    <div className="text-xs text-[#64756B]">{sub}</div>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                      active
                        ? 'bg-[#146C4B] border-[#146C4B] text-white'
                        : 'border-[#DCE5DD] text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Weight History Chart + Log */}
      <section className="bg-white rounded-2xl border border-[#E3E8E2] p-5 space-y-5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-[#10442F]">منحنى تطوّر الوزن</h2>
            <p className="text-xs text-[#64756B] tabular-nums">
              {sortedHistory.length} قراءات مسجّلة · الخط المتقطّع يمثل الهدف ({profile.targetWeight} كغ)
            </p>
          </div>
        </div>

        {chartPoints && (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`}
              className="w-full min-w-[320px] h-44"
              role="img"
              aria-label="رسم بياني لتطور الوزن"
            >
              {/* Target Weight dashed line */}
              <line
                x1="20"
                y1={chartPoints.targetY}
                x2={chartPoints.width - 20}
                y2={chartPoints.targetY}
                stroke="#D97706"
                strokeWidth="1.5"
                strokeDasharray="5 5"
              />
              {/* Weight polyline */}
              {chartPoints.pts.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#146C4B"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chartPoints.polyline}
                />
              )}
              {chartPoints.pts.map(({ x, y, entry }) => (
                <g key={entry.id}>
                  <circle cx={x} cy={y} r="5" fill="#146C4B" stroke="#ffffff" strokeWidth="2" />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    className="fill-[#1D2D24] text-[11px] font-bold"
                  >
                    {entry.weight}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}

        {/* Log List */}
        <div className="divide-y divide-[#EEF2EE] border-t border-[#EEF2EE]">
          {[...sortedHistory].reverse().map((entry) => (
            <div key={entry.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-[#1D2D24] tabular-nums">
                  {entry.weight} كغ
                  {entry.waist ? ` · محيط الكرش ${entry.waist} سم` : ''}
                </div>
                <div className="text-xs text-[#64756B] tabular-nums">
                  {entry.dateISO}
                  {entry.note ? ` · ${entry.note}` : ''}
                </div>
              </div>
              {sortedHistory.length > 1 && (
                <button
                  type="button"
                  onClick={() => onDeleteEntry(entry.id)}
                  aria-label="حذف التسجيل"
                  className="min-h-[40px] min-w-[40px] rounded-xl text-[#8A3B12] hover:bg-[#FDF3EE] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Safe Backup & Restore */}
      <section className="bg-white rounded-2xl border border-[#E3E8E2] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#10442F]">حفظ واسترجاع بياناتك</h3>
          <p className="text-xs text-[#64756B] tabular-nums mt-0.5">
            البيانات تتخزّن أوتوماتيكياً على جهازك · آخر تحديث:{' '}
            {new Date(lastUpdatedISO).toLocaleTimeString('ar-TN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {importFeedback && (
            <p
              className={`text-xs font-semibold mt-1.5 ${
                importFeedback.ok ? 'text-[#146C4B]' : 'text-[#B43C15]'
              }`}
            >
              {importFeedback.msg}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onExportJSON}
            className="min-h-[44px] px-4 rounded-xl border border-[#DCE5DD] text-xs font-bold text-[#1D2D24] flex items-center gap-1.5 hover:bg-[#F6F7F4] transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-[#146C4B]" />
            تحميل نسخة احتياطية
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileImport}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] px-4 rounded-xl bg-[#EAF3EC] text-[#10442F] text-xs font-bold flex items-center gap-1.5 hover:bg-[#DCECE0] transition-colors whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            استرجاع نسخة
          </button>
        </div>
      </section>
    </div>
  );
}
