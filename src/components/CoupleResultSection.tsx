"use client";

import type { SpouseInputs } from "@/lib/types";

interface Props {
  myMonthlyPension: number;      // 본인 이직 후 65세 월 연금 (만원)
  myCurrentAge: number;          // 본인 현재 나이
  spouseInputs: SpouseInputs;
  livingExpense: number;         // 예상 노후 생활비 (만원/월)
  onLivingExpenseChange: (v: number) => void;
}

const A_VALUE = 286;

function calcSpousePension(age: number, subYears: number, salary: number): number {
  const totalYears = subYears + Math.max(0, 65 - age);
  return Math.round((A_VALUE + salary / 12) * 0.01 * totalYears * 10) / 10;
}

/** 65세까지 매월 PMT씩 연 4% 복리로 적립 → 20년간 월 target씩 인출 가능한 PMT */
function calcRequiredMonthlyIRP(
  monthlyShortage: number,
  yearsUntil65: number
): number {
  if (yearsUntil65 <= 0) return monthlyShortage; // 이미 65세 이상이면 바로 계산 불가
  const totalNeeded = monthlyShortage * 12 * 20; // 20년 수령 기준 필요 원금 (만원)
  const r = 0.04;
  const fvFactor = (Math.pow(1 + r, yearsUntil65) - 1) / r;
  const annualIRP = totalNeeded / fvFactor;
  return Math.round((annualIRP / 12) * 10) / 10;
}

function fmt(n: number): string {
  return n.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
}

// ── 슬라이더 ──────────────────────────────────────────────────────────────
function ExpenseSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const MIN = 100, MAX = 1000, STEP = 10;
  const safe = Math.min(MAX, Math.max(MIN, value));

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = Number(e.target.value);
    const snapped = Math.round((raw - MIN) / STEP) * STEP + MIN;
    onChange(Math.min(MAX, Math.max(MIN, snapped)));
  }
  function handleNumber(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = Number(e.target.value);
    if (!isNaN(raw)) {
      const snapped = Math.round((raw - MIN) / STEP) * STEP + MIN;
      onChange(Math.min(MAX, Math.max(MIN, snapped)));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-slate-400">예상 노후 생활비</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={MIN}
            max={MAX}
            step={STEP}
            value={safe}
            onChange={handleNumber}
            className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-right text-sm text-white focus:outline-none focus:border-orange-500"
          />
          <span className="text-slate-400 text-sm">만원/월</span>
        </div>
      </div>
      <input
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={safe}
        onChange={handleSlider}
        className="w-full h-1.5 cursor-pointer accent-orange-500"
      />
      <div className="flex justify-between text-xs text-slate-600 mt-1">
        <span>100만원</span>
        <span className="font-medium text-orange-400">{fmt(safe)}만원/월</span>
        <span>1,000만원</span>
      </div>
    </div>
  );
}

// ── 수평 바 차트 ──────────────────────────────────────────────────────────
function CompareBar({
  label,
  value,
  maxValue,
  color,
  sub,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  sub?: string;
}) {
  const pct = Math.min(100, Math.round((value / maxValue) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-400">{label}</span>
        <span className={`text-base font-bold ${color}`}>{fmt(value)}만원/월</span>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-5 overflow-hidden">
        <div
          className={`h-full rounded-full flex items-center justify-end pr-2 transition-all duration-700 ${
            color === "text-blue-300"
              ? "bg-gradient-to-r from-blue-600 to-blue-400"
              : "bg-gradient-to-r from-orange-600 to-orange-400"
          }`}
          style={{ width: `${pct}%` }}
        >
          {pct >= 20 && (
            <span className="text-xs text-white font-semibold">{pct}%</span>
          )}
        </div>
      </div>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}

export default function CoupleResultSection({
  myMonthlyPension,
  myCurrentAge,
  spouseInputs,
  livingExpense,
  onLivingExpenseChange,
}: Props) {
  const spousePension = calcSpousePension(
    spouseInputs.age,
    spouseInputs.subscriptionYears,
    spouseInputs.salary
  );
  const combinedPension = Math.round((myMonthlyPension + spousePension) * 10) / 10;
  const shortage = Math.round((livingExpense - combinedPension) * 10) / 10;
  const hasShortage = shortage > 0;
  const yearsUntil65 = Math.max(0, 65 - myCurrentAge);
  const requiredMonthlyIRP = hasShortage
    ? calcRequiredMonthlyIRP(shortage, yearsUntil65)
    : 0;

  const barMax = Math.max(combinedPension, livingExpense) * 1.1;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">👫 부부 합산 노후 플랜</h2>

      {/* 합산 수령액 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-blue-500/30 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">본인 65세 월 연금</p>
          <p className="text-xl font-bold text-blue-300">{fmt(myMonthlyPension)}만원</p>
          <p className="text-xs text-slate-600 mt-0.5">이직 후 기준</p>
        </div>
        <div className="bg-slate-800/60 border border-pink-500/30 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">배우자 65세 월 연금</p>
          <p className="text-xl font-bold text-pink-300">{fmt(spousePension)}만원</p>
          <p className="text-xs text-slate-600 mt-0.5">연봉 {fmt(spouseInputs.salary)}만원 기준</p>
        </div>
        <div className={`rounded-xl p-4 text-center border ${
          hasShortage
            ? "bg-rose-950/40 border-rose-500/30"
            : "bg-emerald-950/40 border-emerald-500/30"
        }`}>
          <p className="text-xs text-slate-500 mb-1">부부 합산 월 연금</p>
          <p className={`text-xl font-bold ${hasShortage ? "text-rose-300" : "text-emerald-300"}`}>
            {fmt(combinedPension)}만원
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            {hasShortage ? `생활비 대비 -${fmt(shortage)}만원` : `생활비 대비 +${fmt(-shortage)}만원`}
          </p>
        </div>
      </div>

      {/* 생활비 슬라이더 + 바 차트 */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-5">
        <ExpenseSlider value={livingExpense} onChange={onLivingExpenseChange} />

        <div className="border-t border-slate-700/50 pt-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">
            📊 합산 연금 수령액 vs 예상 생활비
          </h3>
          <CompareBar
            label="부부 합산 월 연금"
            value={combinedPension}
            maxValue={barMax}
            color="text-blue-300"
            sub={`본인 ${fmt(myMonthlyPension)} + 배우자 ${fmt(spousePension)}만원`}
          />
          <CompareBar
            label="예상 노후 생활비"
            value={livingExpense}
            maxValue={barMax}
            color="text-orange-300"
          />
        </div>

        {/* 커버리지 비율 */}
        <div className="bg-slate-900/50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-slate-400">연금 커버리지</span>
          <div className="text-right">
            <span className={`text-lg font-bold ${hasShortage ? "text-rose-300" : "text-emerald-300"}`}>
              {Math.round((combinedPension / livingExpense) * 100)}%
            </span>
            <span className="text-xs text-slate-500 ml-1">충당</span>
          </div>
        </div>
      </div>

      {/* 부족분 IRP 메시지 */}
      {hasShortage ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-950/60 to-slate-900/60 border border-rose-400/40 rounded-xl p-5">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-rose-500/8 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">⚠️</span>
            <div className="space-y-3 flex-1">
              <div>
                <p className="text-base font-bold text-rose-200">
                  월 <span className="text-rose-300 text-xl">{fmt(shortage)}만원</span> 부족
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  부부 합산 연금 {fmt(combinedPension)}만원 → 생활비 {fmt(livingExpense)}만원 미달
                </p>
              </div>
              {yearsUntil65 > 0 && (
                <div className="bg-slate-800/60 border border-orange-500/25 rounded-lg p-3.5">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    💡 IRP로 채우려면 지금부터 월{" "}
                    <span className="text-orange-300 font-bold text-base">{fmt(requiredMonthlyIRP)}만원</span>{" "}
                    필요
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5">
                    연 4% 수익률 가정 · {yearsUntil65}년 적립 · 65세 이후 20년간 부족분 충당
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900/60 border border-emerald-400/30 rounded-xl p-5 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-base font-bold text-emerald-200">
              부부 합산 연금이 생활비를 충당합니다
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              월 <span className="text-emerald-300 font-semibold">{fmt(-shortage)}만원</span> 여유가 생깁니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
