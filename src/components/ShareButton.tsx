"use client";

import { useState } from "react";
import type { SimulatorInputs, SimulatorResults } from "@/lib/types";
import type { PeerRankResult } from "@/lib/peer-data";

interface Props {
  inputs: SimulatorInputs;
  results: SimulatorResults;
  peerRank?: PeerRankResult | null;
}

function fmt(n: number): string {
  return n.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
}

function buildShareText(inputs: SimulatorInputs, results: SimulatorResults, peerRank?: PeerRankResult | null): string {
  const { current, afterChange, monthlyDiff, total30Diff } = results;
  const sign = monthlyDiff >= 0 ? "+" : "";

  const gradeLines = peerRank
    ? [
        "",
        `🏆 동료 비교 등급: ${peerRank.grade}등급 (${peerRank.ageGroup} ${peerRank.job}직 상위 ${peerRank.topPercent}%)`,
      ]
    : [];

  return [
    "📊 연금 이직 시뮬레이션 결과",
    "",
    `👤 현재 나이: ${inputs.currentAge}세 | 가입기간: ${inputs.subscriptionYears}년`,
    `💼 현재 연봉: ${fmt(inputs.currentSalary)}만원 → 이직 후: ${fmt(inputs.newSalary)}만원`,
    "",
    "[ 국민연금 월 수령액 (65세~) ]",
    `현재 유지: ${fmt(current.monthlyPension)}만원`,
    `이직 후:   ${fmt(afterChange.monthlyPension)}만원`,
    `차이:      ${sign}${fmt(monthlyDiff)}만원/월`,
    "",
    "[ 30년 누적 수령액 ]",
    `현재 유지: ${fmt(current.totalPension30)}만원`,
    `이직 후:   ${fmt(afterChange.totalPension30)}만원`,
    `차이:      ${sign}${fmt(total30Diff)}만원`,
    ...gradeLines,
    "",
    "🔗 연금 이직 시뮬레이터로 나도 계산해보기",
  ].join("\n");
}

export default function ShareButton({ inputs, results, peerRank }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = buildShareText(inputs, results, peerRank);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleKakao = () => {
    const text = encodeURIComponent(buildShareText(inputs, results, peerRank));
    window.open(`https://story.kakao.com/share?url=${encodeURIComponent(window.location.href)}&text=${text}`, "_blank");
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(buildShareText(inputs, results, peerRank));
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
      <h3 className="text-base font-semibold text-slate-300 mb-3">🔗 결과 공유하기</h3>
      {peerRank && (
        <p className="text-xs text-slate-500 mb-3">
          카카오 공유 시 <span className="text-violet-400 font-semibold">{peerRank.grade}등급</span> 정보가 포함됩니다.
        </p>
      )}
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
  );
}
