"use client";

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedMonth: string;
  setSelectedMonth: (v: string) => void;
  selectedGroup: string;
  setSelectedGroup: (v: string) => void;
  fromDate: string;
  setFromDate: (v: string) => void;
  toDate: string;
  setToDate: (v: string) => void;
}

export default function WanaosubiriFilters(props: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow dark:bg-white/[0.03]">

      <input
        type="text"
        placeholder="Search name, phone or member no..."
        value={props.searchTerm}
        onChange={(e) => props.setSearchTerm(e.target.value)}
        className="border border-gray-300 bg-white p-2 rounded text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
      />

      <input
        type="month"
        value={props.selectedMonth}
        onChange={(e) => props.setSelectedMonth(e.target.value)}
        className="border border-gray-300 bg-white p-2 rounded text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      />

      <input
        type="date"
        value={props.fromDate}
        onChange={(e) => props.setFromDate(e.target.value)}
        className="border border-gray-300 bg-white p-2 rounded text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      />

      <input
        type="date"
        value={props.toDate}
        onChange={(e) => props.setToDate(e.target.value)}
        className="border border-gray-300 bg-white p-2 rounded text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      />

    </div>
  );
}