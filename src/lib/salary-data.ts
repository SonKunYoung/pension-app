export interface SalaryEntry {
  name: string;
  salary: number; // 만원 단위 연봉
  category: "대기업" | "IT" | "금융" | "직무";
}

export const SALARY_DATA: SalaryEntry[] = [
  // IT / 플랫폼
  { name: "네이버", salary: 12000, category: "IT" },
  { name: "카카오", salary: 11500, category: "IT" },
  { name: "토스 (비바리퍼블리카)", salary: 12500, category: "IT" },
  { name: "쿠팡", salary: 9500, category: "IT" },
  { name: "배달의민족 (우아한형제들)", salary: 9800, category: "IT" },
  { name: "라인플러스", salary: 10000, category: "IT" },
  { name: "크래프톤", salary: 11000, category: "IT" },
  { name: "넥슨", salary: 9000, category: "IT" },
  { name: "넷마블", salary: 8500, category: "IT" },

  // 대기업 / 제조
  { name: "삼성전자", salary: 12000, category: "대기업" },
  { name: "SK하이닉스", salary: 11000, category: "대기업" },
  { name: "LG전자", salary: 9500, category: "대기업" },
  { name: "현대자동차", salary: 9800, category: "대기업" },
  { name: "현대모비스", salary: 8500, category: "대기업" },
  { name: "포스코", salary: 9000, category: "대기업" },
  { name: "삼성SDS", salary: 9500, category: "대기업" },
  { name: "LG CNS", salary: 8000, category: "대기업" },
  { name: "롯데그룹", salary: 7500, category: "대기업" },

  // 통신
  { name: "SK텔레콤", salary: 10500, category: "대기업" },
  { name: "KT", salary: 8200, category: "대기업" },
  { name: "LG유플러스", salary: 7800, category: "대기업" },

  // 금융
  { name: "KB국민은행", salary: 9200, category: "금융" },
  { name: "신한은행", salary: 9000, category: "금융" },
  { name: "하나은행", salary: 8800, category: "금융" },
  { name: "우리은행", salary: 8500, category: "금융" },
  { name: "NH농협은행", salary: 8200, category: "금융" },
  { name: "삼성생명", salary: 8500, category: "금융" },
  { name: "카카오뱅크", salary: 10000, category: "금융" },
  { name: "토스뱅크", salary: 10500, category: "금융" },

  // 직무별 평균
  { name: "백엔드 개발자 (직무 평균)", salary: 7000, category: "직무" },
  { name: "프론트엔드 개발자 (직무 평균)", salary: 6500, category: "직무" },
  { name: "소프트웨어 엔지니어 (직무 평균)", salary: 7500, category: "직무" },
  { name: "데이터 사이언티스트 (직무 평균)", salary: 7800, category: "직무" },
  { name: "DevOps / 인프라 (직무 평균)", salary: 7200, category: "직무" },
  { name: "UI/UX 디자이너 (직무 평균)", salary: 5500, category: "직무" },
  { name: "마케터 (직무 평균)", salary: 5000, category: "직무" },
  { name: "기획 / PM (직무 평균)", salary: 5800, category: "직무" },
  { name: "영업 (직무 평균)", salary: 5500, category: "직무" },
  { name: "인사 / HR (직무 평균)", salary: 5000, category: "직무" },
  { name: "재무 / 회계 (직무 평균)", salary: 5500, category: "직무" },
  { name: "공무원 7급", salary: 3600, category: "직무" },
  { name: "공무원 9급", salary: 3000, category: "직무" },
  { name: "간호사 (직무 평균)", salary: 4200, category: "직무" },
  { name: "의사 (직무 평균)", salary: 15000, category: "직무" },
  { name: "변호사 (직무 평균)", salary: 10000, category: "직무" },
];

export function searchSalary(query: string): SalaryEntry[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().replace(/\s/g, "");
  return SALARY_DATA.filter((e) =>
    e.name.toLowerCase().replace(/\s/g, "").includes(q)
  ).slice(0, 8);
}
