"use client";


import { useState } from "react";
import { useSearchParams } from "next/navigation";
import WanaosubiriFilters from "./WanaosubiriFilter";
import WanaosubiriList from "./WanaosubiriList";

export default function Wanaosubiri() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div className="space-y-6">
      {/* Filters */}
      <WanaosubiriFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
      />

      {/* Members List */}
      <WanaosubiriList
        searchTerm={searchTerm}
        selectedMonth={selectedMonth}
        fromDate={fromDate}
        toDate={toDate}
        statusFilter={searchParams.get("status") ?? ""}
      />

    </div>
  );
}
