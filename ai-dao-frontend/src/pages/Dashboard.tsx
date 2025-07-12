import React, { useEffect, useState, useMemo, useRef } from "react";
import { fetchProposals } from "../services/api";
import type { Proposal } from "../types";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import DecisionFlow from "../components/DecisionFlow";
import { FilterPanel } from "../components/FilterPanel";
import { MetricsSection } from "../components/MetricsSection";
import { ChartsSection } from "../components/ChartsSection";
import { AnimatePresence } from "framer-motion";
import { DateFilter } from "../components/DateFilter";
import type { Range } from "react-date-range";
import { Funnel } from "lucide-react";
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import SideChart from "../components/SideChart";

export const Dashboard: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filters, setFilters] = useState({
    yes: false,
    no: false,
    abstain: false,
  });

  // date picker state
  const [dateRangeLabel, setDateRangeLabel] = useState("All time");
  const [tempRange, setTempRange] = useState<Range[]>([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ]);
  const [appliedRange, setAppliedRange] = useState<Range[] | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // filter dropdown
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // refs for outside-click
  const filterRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // fetch data
  useEffect(() => {
    fetchProposals().then(setProposals).catch(console.error);
  }, []);

  // date picker handlers
  const openDatePicker = () => {
    // przy otwieraniu date picker zamknij filtr
    setIsFilterOpen(false);
    setIsDatePickerOpen((o) => !o);
  };
  const applyDateRange = () => {
    const { startDate, endDate } = tempRange[0];
    if (startDate!.getTime() === endDate!.getTime()) {
      setDateRangeLabel(format(startDate!, "MMM d, yyyy"));
    } else {
      setDateRangeLabel(
        `${format(startDate!, "MMM d, yyyy")} - ${format(
          endDate!,
          "MMM d, yyyy"
        )}`
      );
    }
    setAppliedRange([{ ...tempRange[0] }]);
    setIsDatePickerOpen(false);
  };

  // close filter dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [isFilterOpen]);

  // close date picker on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(e.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };
    if (isDatePickerOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [isDatePickerOpen]);

  // filtering with date & AI decision
  const filtered = useMemo(() => {
    return proposals
      .filter((p) => {
        if (appliedRange) {
          const pDate = p.date instanceof Date ? p.date : new Date(p.date);
          const start = startOfDay(appliedRange[0].startDate!);
          const end = endOfDay(appliedRange[0].endDate!);
          if (!isWithinInterval(pDate, { start, end })) return false;
        }
        return true;
      })
      .filter((p) => {
        if (!filters.yes && !filters.no && !filters.abstain) return true;
        return filters[p.aiDecision as keyof typeof filters];
      });
  }, [proposals, appliedRange, filters]);

  // metrics
  const total = filtered.length;
  const yesCount = filtered.filter((p) => p.aiDecision === "yes").length;
  const noCount = filtered.filter((p) => p.aiDecision === "no").length;
  const abstainCount = filtered.filter(
    (p) => p.aiDecision === "abstain"
  ).length;
  const avgSentiment = total
    ? (filtered.reduce((sum, p) => sum + p.sentimentScore, 0) / total) * 100
    : 0;
  const participation = total ? (yesCount + noCount) / total : 0;
  const sentimentTrend = filtered.map((p, i) => ({
    x: `#${i + 1}`,
    y: Math.round(p.sentimentScore * 100),
  }));
  const voteDistribution = [
    { category: "Yes", count: yesCount },
    { category: "No", count: noCount },
    { category: "Abstain", count: abstainCount },
  ];

  const proposalTrend = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((p) => {
      const d = format(new Date(p.date), "MMM d");
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }, [filtered]);
  return (
    <div className="space-y-6">
      {/* header with both dropdowns */}
      <div className="flex items-center justify-between" ref={filterRef}>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Dashboard
        </h2>
        <div className="relative flex items-center space-x-2">
          {/* Filter button + dropdown */}
          <button
            onClick={() => {
              setIsFilterOpen((o) => !o);
              setIsDatePickerOpen(false);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-900"
          >
            <Funnel className="w-5 h-5 text-gray-900 dark:text-gray-300" />
          </button>
          <AnimatePresence>
            {isFilterOpen && (
              <FilterPanel
                filters={filters}
                onToggle={(key) =>
                  setFilters((f) => ({ ...f, [key]: !f[key] }))
                }
              />
            )}
          </AnimatePresence>

          {/* Date picker button + dropdown */}
          <div ref={datePickerRef} className="relative">
            <DateFilter
              label={dateRangeLabel}
              onOpen={openDatePicker}
              isOpen={isDatePickerOpen}
              tempRange={tempRange}
              onChangeRange={(ranges) => setTempRange(ranges)}
              onApply={applyDateRange}
              onReset={() => {
                setAppliedRange(null);
                setDateRangeLabel("All time");
                setIsDatePickerOpen(false);
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex space-x-6">
        {/* DecisionFlow zajmie 2/3 szerokości kontenera */}
        <div className="w-4/6">
          <DecisionFlow
            proposals={filtered}
            threshold={Math.round(avgSentiment)}
          />
        </div>

        {/* SideChart zajmie 1/3 szerokości kontenera i będzie węższy */}
        <div className="w-2/6">
          <SideChart voteDistribution={voteDistribution} />
        </div>
      </div>
      <MetricsSection
        total={total}
        avgSentiment={avgSentiment}
        participation={participation}
        sentimentTrend={sentimentTrend}
      />

      <ChartsSection
        proposalTrend={proposalTrend}
        sentimentTrend={sentimentTrend}
      />
    </div>
  );
};

export default Dashboard;
