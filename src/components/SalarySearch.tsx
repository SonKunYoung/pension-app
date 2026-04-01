"use client";

import { useState, useRef, useEffect } from "react";
import { searchSalary, type SalaryEntry } from "@/lib/salary-data";

const CATEGORY_COLOR: Record<SalaryEntry["category"], string> = {
  IT: "bg-blue-500/20 text-blue-300",
  대기업: "bg-purple-500/20 text-purple-300",
  금융: "bg-amber-500/20 text-amber-300",
  직무: "bg-slate-500/20 text-slate-300",
};

interface Props {
  label: string;
  onSelect: (salary: number) => void;
}

export default function SalarySearch({ label, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SalaryEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const found = searchSalary(query);
    setResults(found);
    setOpen(found.length > 0 && query.length > 0);
  }, [query]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(entry: SalaryEntry) {
    setSelected(entry.name);
    setQuery(entry.name);
    setOpen(false);
    onSelect(entry.salary);
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs text-slate-500 mb-1">
        {label} — 회사/직무 검색으로 자동 입력
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
        <input
          type="text"
          placeholder="삼성전자, 네이버, 백엔드 개발자..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          onFocus={() => query && setOpen(results.length > 0)}
          className="w-full pl-8 pr-3 py-2 bg-slate-700/60 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        {selected && (
          <button
            onClick={() => { setQuery(""); setSelected(null); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {open && (
        <ul className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-xl overflow-hidden shadow-xl">
          {results.map((entry) => (
            <li key={entry.name}>
              <button
                type="button"
                onClick={() => handleSelect(entry)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-700 transition-colors text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${CATEGORY_COLOR[entry.category]}`}>
                    {entry.category}
                  </span>
                  <span className="text-sm text-white truncate">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold text-emerald-400 shrink-0 ml-2">
                  {entry.salary.toLocaleString()}만원
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
