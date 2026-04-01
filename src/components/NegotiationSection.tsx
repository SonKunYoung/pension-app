"use client";

import { useState } from "react";
import type { SimulatorInputs } from "@/lib/types";
import { calculateNegotiation } from "@/lib/calculator";

interface Props {
  inputs: SimulatorInputs;
}

function fmt(n: number): string {
  return n.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
}

function buildShareText(inputs: SimulatorInputs): string {
  const r = calculateNegotiation(inputs);
  return [
    "💼 연봉 협상 시뮬레이션 결과",
    "",
    `현재 연봉: ${fmt(inputs.currentSalary)}만원 → 목표: ${fmt(inputs.targetSalary)}만원 (+${fmt(r.raise)}만원)`,
    "",
    `📥 연간 실수령액 증가: +${fmt(r.annualTakeHomeIncrease)}만원`,
    `🏦 65세 월 연금 증가:  +${fmt(r.monthlyPensionIncrease)}만원/월`,
    `📊 30년 누적 연금 증가: +${fmt(r.total30Increase)}만원`,
    "",
    `✨ 이 연봉 인상의 평생 가치는 총 ${fmt(r.lifetimeValue)}만원입니다`,
    "",
    "🔗 연금 이직 시뮬레이터로 나도 계산해보기",
  ].join("\n");
}

export default function NegotiationSection({ inputs }: Props) {
  const [copied, setCopied] = useState(false);

  const result = calculateNegotiation(inputs);
  const { raise, annualTakeHomeIncrease, monthlyPensionIncrease, total30Increase, lifetimeValue, workingYears } = result;
  const hasRaise = raise > 0;

  const handleCopy = async () => {
    const text = buildShareText(inputs);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(buildShareText(inputs));
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleKakao = () => {
    const text = encodeURIComponent(buildShareText(inputs));
    window.open(
      `https://story.kakao.com/share?url=${encodeURIComponent(window.location.href)}&text=${text}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <h2 className="text-xl font-bold text-white">💼 연봉 협상 시뮬레이터</h2>

      {!hasRaise ? (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 text-center text-slate-400 text-sm">
          입력 섹션에서 협상 목표 연봉을 현재 연봉보다 높게 설정하면 결과가 표시됩니다.
        </div>
      ) : (
        <>
          {/* 인상액 배너 */}
          <div className="flex items-center gap-3 bg-green-950/50 border border-green-500/30 rounded-xl px-5 py-3.5">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-sm text-slate-400">협상 목표</p>
              <p className="text-base font-bold text-white">
                <span className="text-slate-400">{fmt(inputs.currentSalary)}만원</span>
                <span className="text-slate-500 mx-2">→</span>
                <span className="text-green-300">{fmt(inputs.targetSalary)}만원</span>
                <span className="ml-2 text-green-400 text-sm font-semibold">(+{fmt(raise)}만원 인상)</span>
              </p>
            </div>
          </div>

          {/* 4개 지표 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              emoji="📥"
              label="연간 실수령액 증가"
              value={`+${fmt(annualTakeHomeIncrease)}만원`}
              sub="세금·4대보험 공제 후"
              color="green"
            />
            <MetricCard
              emoji="🏦"
              label="65세 월 연금 증가"
              value={`+${fmt(monthlyPensionIncrease)}만원/월`}
              sub="국민연금 기준"
              color="blue"
            />
            <MetricCard
              emoji="📊"
              label="30년 누적 연금 증가"
              value={`+${fmt(total30Increase)}만원`}
              sub="65세~95세 수령 합산"
              color="purple"
            />
          </div>

          {/* 평생 가치 카드 */}
          <div className="relative overflow-hidden bg-gradient-to-r from-green-950/70 via-emerald-950/50 to-slate-900/70 border border-green-400/40 rounded-xl p-6 text-center shadow-lg shadow-green-900/20">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
            <p className="text-sm text-slate-400 mb-2">
              근무기간 실수령 증가({workingYears}년) + 30년 누적 연금 증가
            </p>
            <p className="text-lg font-semibold text-slate-200 mb-1">
              이 연봉 인상의 평생 가치는
            </p>
            <p className="text-4xl font-extrabold text-green-300 mb-1 tracking-tight">
              총 {fmt(lifetimeValue)}만원
            </p>
            <p className="text-xs text-slate-500">입니다</p>
          </div>

          {/* 공유 버튼 */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-300 mb-3">🔗 협상 결과 공유하기</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all rounded-lg text-sm font-medium"
              >
                {copied ? (
                  <><span>✅</span><span>복사됨!</span></>
                ) : (
                  <><span>📋</span><span>결과 텍스트 복사</span></>
                )}
              </button>
              <button
                onClick={handleTwitter}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 border border-[#1DA1F2]/30 active:scale-95 transition-all rounded-lg text-sm font-medium text-[#1DA1F2]"
              >
                <span>𝕏</span>
                <span>트위터에 공유</span>
              </button>
              <button
                onClick={handleKakao}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#FEE500]/15 hover:bg-[#FEE500]/25 border border-[#FEE500]/30 active:scale-95 transition-all rounded-lg text-sm font-medium text-[#FEE500]"
              >
                <span>💬</span>
                <span>카카오스토리 공유</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  emoji,
  label,
  value,
  sub,
  color,
}: {
  emoji: string;
  label: string;
  value: string;
  sub: string;
  color: "green" | "blue" | "purple";
}) {
  const borderColor =
    color === "green"
      ? "border-green-500/30"
      : color === "blue"
      ? "border-blue-500/30"
      : "border-purple-500/30";
  const valueColor =
    color === "green"
      ? "text-green-300"
      : color === "blue"
      ? "text-blue-300"
      : "text-purple-300";

  return (
    <div className={`bg-slate-800/60 border ${borderColor} rounded-xl p-4 text-center`}>
      <div className="text-2xl mb-2">{emoji}</div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-xs text-slate-600 mt-1">{sub}</p>
    </div>
  );
}
