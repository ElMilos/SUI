// src/components/Dashboard.tsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { fetchProposals } from "../services/api";
import type { Proposal } from "../types";
import { io, Socket } from "socket.io-client";
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
import { useTheme } from "../contexts/ThemeContext";
import LastProposalCard from "../components/LastProposalCard";

export const Dashboard: React.FC = () => {
  const { darkMode } = useTheme();
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

  // socket ref
  const socketRef = useRef<Socket | null>(null);

  // 1) jednorazowy HTTP fetch
  useEffect(() => {
    fetchProposals().then(setProposals).catch(console.error);
  }, []);

  // 2) połączenie WebSocket
useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
    const SOCKET_URL = API_BASE.replace(/^http/, "ws");
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 WS connected", socket.id);
    });

    socket.on("proposals", (newProposals: Proposal[]) => {
      setProposals(newProposals);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 WS disconnected:", reason);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // date picker handlers
  const openDatePicker = () => {
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

  // outside-click hooks (filter & date)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [isFilterOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(e.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };
    if (isDatePickerOpen) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [isDatePickerOpen]);

  // filtrowanie
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

  // metryki
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between" ref={filterRef}>
        <h2
          className={`${
            darkMode ? "text-gray-100" : "text-gray-900"
          } text-2xl font-semibold`}
        >
          Dashboard
        </h2>
        <div className="relative flex items-center space-x-2">
          <button
            onClick={() => {
              setIsFilterOpen((o) => !o);
              setIsDatePickerOpen(false);
            }}
            className={`${
              darkMode
                ? "bg-gray-900 hover:bg-gray-700"
                : "bg-gray-100 hover:bg-gray-200"
            } p-2 rounded-lg transition-colors duration-200`}
          >
            <Funnel
              className={`${
                darkMode ? "text-gray-300" : "text-gray-900"
              } w-5 h-5`}
            />
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
          <div ref={datePickerRef} className="relative">
            <DateFilter
              label={dateRangeLabel}
              onOpen={openDatePicker}
              isOpen={isDatePickerOpen}
              tempRange={tempRange}
              onChangeRange={setTempRange}
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

      {proposals.length > 0 && <LastProposalCard proposal={proposals[0]} />}

      <div className="flex flex-col space-y-6 md:flex-row md:space-y-0 md:space-x-6">
        <div className="w-full md:w-4/6">
          <DecisionFlow
            proposals={filtered}
            threshold={Math.round(avgSentiment)}
          />
        </div>
        <div className="w-full md:w-2/6">
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
