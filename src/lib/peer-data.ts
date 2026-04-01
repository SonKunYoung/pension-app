import type { JobRole } from "./types";

export type AgeGroup = "20대" | "30대" | "40대" | "50대";
export type GradeLabel = "S" | "A" | "B" | "C";

export interface PeerSample {
  ageGroup: AgeGroup;
  job: JobRole;
  monthlyPensionAt65: number; // 만원
}

export interface PeerRankResult {
  ageGroup: AgeGroup;
  job: JobRole;
  peerCount: number;
  topPercent: number;  // 상위 몇 %
  grade: GradeLabel;
}

// ── 결정적 LCG 난수 생성기 (seed=42) ──────────────────────────────────────
function makeLcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const A_VALUE = 286; // 국민연금 A값 (만원)

function pensionAt65(salary: number, subYears: number, ageMid: number): number {
  const totalYears = subYears + Math.max(0, 65 - ageMid);
  return Math.round((A_VALUE + salary / 12) * 0.01 * totalYears * 10) / 10;
}

// ── 직무×나이대별 연봉 범위 (만원) ─────────────────────────────────────────
const SALARY_RANGES: Record<JobRole, Record<AgeGroup, [number, number]>> = {
  개발:   { "20대": [3000, 4800], "30대": [4500, 8000], "40대": [6000, 12000], "50대": [7000, 15000] },
  마케팅: { "20대": [2600, 3600], "30대": [3200,  5500], "40대": [4000,  7000], "50대": [4500,  8000] },
  영업:   { "20대": [2800, 4000], "30대": [3500,  6000], "40대": [4500,  8000], "50대": [5000,  9000] },
  재무:   { "20대": [3000, 4200], "30대": [3800,  6500], "40대": [5000,  8500], "50대": [5500, 10000] },
  인사:   { "20대": [2800, 3800], "30대": [3400,  5500], "40대": [4200,  7000], "50대": [4800,  8000] },
  디자인: { "20대": [2600, 3800], "30대": [3200,  5200], "40대": [4000,  7000], "50대": [4500,  8000] },
  생산:   { "20대": [2800, 4000], "30대": [3200,  5000], "40대": [4000,  6500], "50대": [4500,  7500] },
};

const SUB_YEARS_RANGE: Record<AgeGroup, [number, number]> = {
  "20대": [0,  5],
  "30대": [3, 12],
  "40대": [10, 22],
  "50대": [18, 32],
};

const AGE_MID: Record<AgeGroup, number> = {
  "20대": 25, "30대": 35, "40대": 45, "50대": 55,
};

const AGE_GROUPS: AgeGroup[] = ["20대", "30대", "40대", "50대"];
const JOB_ROLES: JobRole[]   = ["개발", "마케팅", "영업", "재무", "인사", "디자인", "생산"];

// ── 200명 샘플 데이터 생성 ────────────────────────────────────────────────
// 4 age × 7 job = 28 cells. 앞 4 cell은 8명, 나머지 24 cell은 7명 → 32 + 168 = 200명
export const PEER_SAMPLES: PeerSample[] = (() => {
  const rand = makeLcg(42);
  const out: PeerSample[] = [];

  for (let ai = 0; ai < AGE_GROUPS.length; ai++) {
    for (let ji = 0; ji < JOB_ROLES.length; ji++) {
      const ageGroup = AGE_GROUPS[ai];
      const job      = JOB_ROLES[ji];
      const [salMin, salMax] = SALARY_RANGES[job][ageGroup];
      const [subMin, subMax] = SUB_YEARS_RANGE[ageGroup];
      const mid  = AGE_MID[ageGroup];
      const count = ai * JOB_ROLES.length + ji < 4 ? 8 : 7;

      for (let k = 0; k < count; k++) {
        const salary   = Math.round((salMin + rand() * (salMax - salMin)) / 100) * 100;
        const subYears = Math.round(subMin + rand() * (subMax - subMin));
        out.push({ ageGroup, job, monthlyPensionAt65: pensionAt65(salary, subYears, mid) });
      }
    }
  }
  return out;
})();

// ── 나이 → 나이대 ──────────────────────────────────────────────────────────
export function getAgeGroup(age: number): AgeGroup {
  if (age < 30) return "20대";
  if (age < 40) return "30대";
  if (age < 50) return "40대";
  return "50대";
}

// ── 등급 계산 ──────────────────────────────────────────────────────────────
export function calcPeerRank(
  age: number,
  job: JobRole,
  monthlyPension: number
): PeerRankResult {
  const ageGroup  = getAgeGroup(age);
  const peers     = PEER_SAMPLES.filter(p => p.ageGroup === ageGroup && p.job === job);
  const peerCount = peers.length;
  const countBelow = peers.filter(p => p.monthlyPensionAt65 < monthlyPension).length;
  // topPercent: 1 → 상위 1% (최상위), 100 → 최하위
  const topPercent = Math.round((1 - countBelow / peerCount) * 100);

  let grade: GradeLabel;
  if (topPercent <= 10)      grade = "S";
  else if (topPercent <= 30) grade = "A";
  else if (topPercent <= 50) grade = "B";
  else                       grade = "C";

  return { ageGroup, job, peerCount, topPercent, grade };
}
