"use client";

import type { SimulatorInputs, SimulatorResults } from "@/lib/types";
import type { PeerRankResult, GradeLabel } from "@/lib/peer-data";

interface Props {
  inputs: SimulatorInputs;
  results: SimulatorResults;
  peerRank: PeerRankResult;
}

function fmt(n: number): string {
  return n.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
}

const GRADE_CONFIG: Record<GradeLabel, {
  bg: string;
  border: string;
  text: string;
  badge: string;
  glow: string;
  label: string;
  message: string;
}> = {
  S: {
    bg: "from-yellow-950/60 via-amber-950/40 to-slate-900/60",
    border: "border-yellow-400/50",
    text: "text-yellow-300",
    badge: "bg-yellow-400/20 border-yellow-400/40 text-yellow-300",
    glow: "bg-yellow-500/10",
    label: "S등급",
    message: "탁월합니다! 동료 대비 최상위 연금 수준이에요.",
  },
  A: {
    bg: "from-violet-950/60 via-purple-950/40 to-slate-900/60",
    border: "border-violet-400/50",
    text: "text-violet-300",
    badge: "bg-violet-400/20 border-violet-400/40 text-violet-300",
    glow: "bg-violet-500/10",
    label: "A등급",
    message: "훌륭해요! 상위 30% 이내의 연금을 준비하고 있어요.",
  },
  B: {
    bg: "from-emerald-950/60 via-green-950/40 to-slate-900/60",
    border: "border-emerald-400/50",
    text: "text-emerald-300",
    badge: "bg-emerald-400/20 border-emerald-400/40 text-emerald-300",
    glow: "bg-emerald-500/10",
    label: "B등급",
    message: "평균 수준이에요. IRP 납입으로 등급을 올릴 수 있어요.",
  },
  C: {
    bg: "from-slate-800/60 via-slate-850/40 to-slate-900/60",
    border: "border-slate-500/40",
    text: "text-slate-300",
    badge: "bg-slate-500/20 border-slate-500/40 text-slate-300",
    glow: "bg-slate-500/8",
    label: "C등급",
    message: "연금 준비를 강화할 필요가 있어요. 연봉 협상과 IRP를 활용해보세요.",
  },
};

// 간이 퍼센트 바 — topPercent가 낮을수록(상위권일수록) 바가 가득 참
function RankBar({ topPercent, grade }: { topPercent: number; grade: GradeLabel }) {
  const fill = Math.max(2, 100 - topPercent); // 상위 5% → 95% 채움
  const colorClass =
    grade === "S" ? "bg-yellow-400" :
    grade === "A" ? "bg-violet-400" :
    grade === "B" ? "bg-emerald-400" : "bg-slate-400";

  return (
    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${fill}%` }}
      />
    </div>
  );
}

export default function PeerRankSection({ inputs, results, peerRank }: Props) {
  const { ageGroup, job, peerCount, topPercent, grade } = peerRank;
  const cfg = GRADE_CONFIG[grade];
  const monthlyPension = results.afterChange.monthlyPension;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">🏆 동료 비교 등급</h2>

      <div className={`relative overflow-hidden bg-gradient-to-br ${cfg.bg} border ${cfg.border} rounded-xl p-6 shadow-lg`}>
        {/* 배경 글로우 */}
        <div className={`absolute -top-12 -right-12 w-48 h-48 ${cfg.glow} rounded-full blur-3xl pointer-events-none`} />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          {/* 등급 뱃지 */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className={`w-24 h-24 rounded-2xl border-2 ${cfg.badge} flex items-center justify-center shadow-xl`}>
              <span className={`text-5xl font-black ${cfg.text}`}>{grade}</span>
            </div>
            <span className={`mt-2 text-sm font-semibold ${cfg.text}`}>{cfg.label}</span>
          </div>

          {/* 상세 정보 */}
          <div className="flex-1 space-y-3">
            <div>
              <p className={`text-2xl font-bold ${cfg.text}`}>
                상위 {topPercent}%
              </p>
              <p className="text-sm text-slate-400 mt-0.5">
                {ageGroup} · {job}직 {peerCount}명 중
              </p>
            </div>

            <RankBar topPercent={topPercent} grade={grade} />

            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500">내 65세 월 연금 (이직 후)</p>
                <p className={`font-bold ${cfg.text}`}>{fmt(monthlyPension)}만원/월</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">비교 그룹</p>
                <p className="font-bold text-white">{ageGroup} {job}직 {peerCount}명</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 bg-slate-800/50 rounded-lg px-3 py-2">
              💬 {cfg.message}
            </p>
          </div>
        </div>

        {/* 등급 기준 안내 */}
        <div className="mt-5 pt-4 border-t border-slate-700/50 grid grid-cols-4 gap-2 text-center text-xs">
          {(["S", "A", "B", "C"] as GradeLabel[]).map((g) => {
            const isActive = g === grade;
            const labelMap = { S: "상위 10%", A: "상위 30%", B: "상위 50%", C: "그 외" };
            const colorMap: Record<GradeLabel, string> = {
              S: "text-yellow-300", A: "text-violet-300", B: "text-emerald-300", C: "text-slate-400",
            };
            return (
              <div
                key={g}
                className={`rounded-lg py-1.5 px-1 transition-all ${
                  isActive ? "bg-slate-700/60 ring-1 ring-slate-500" : "opacity-50"
                }`}
              >
                <p className={`font-black text-base ${colorMap[g]}`}>{g}</p>
                <p className="text-slate-500">{labelMap[g]}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
