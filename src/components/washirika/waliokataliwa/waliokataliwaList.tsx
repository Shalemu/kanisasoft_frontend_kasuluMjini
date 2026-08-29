"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";
import {
  FaUserPlus,
  FaFilter,
  FaSms,
  FaCheck,
  FaTimes,
  FaUsers,
  FaFileExcel,
  FaFilePdf, 
} from "react-icons/fa";
import { useWashirikaExport } from "@/hooks/useWashirikaExport";
import { UserX } from "lucide-react";
import {
  getMembershipStatusLabel,
  type MembershipStatusLabels,
} from "@/lib/memberLabels";

interface User {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  role?: string | null;
  member_id?: number;
  membership_status?: string;
  residential_zone?: string;
  membership_number?: string;
  created_at?: string;
  deactivation_reason?: string | null;
}

interface Props {
  searchTerm: string;
  selectedMonth?: string;
  selectedGroup?: string;
  fromDate?: string;
  toDate?: string;
  setLoading: (value: boolean) => void;
}

export default function WaliokataliwaList({ searchTerm, }: Props) {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [statusLabels, setStatusLabels] = useState<MembershipStatusLabels | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  //export
  const { exportToExcel, exportToPDF } = useWashirikaExport();


useEffect(() => {
  async function fetchRejectedMembers() {
    setLoading(true);

    try {
      const data = await apiFetch("/users");
            console.log(
        "ESTHER FROM API:",
        data.users?.filter((u: any) =>
          u.full_name?.toLowerCase().includes("esther")
        )
      );

      if (data?.users) {
        setStatusLabels(data.membership_status_labels ?? null);

        const rejected = data.users.filter(
          (u: any) => u.membership_status === "rejected"
        );

        setMembers(rejected);
      }
    } catch (err) {
      console.error("Error fetching rejected members:", err);
      Swal.fire("Error", "Imeshindikana kupakia data", "error");
    } finally {
      setLoading(false);
    }
  }

  fetchRejectedMembers();
}, []);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      return (
        m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone?.includes(searchTerm)
      );
    });
  }, [members, searchTerm]);


  const totalPages = Math.ceil(filteredMembers.length / rowsPerPage);

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );


  const toggleSelect = (id: number) => {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  
  const toggleSelectAll = () => {
    const pageIds = paginatedMembers.map((m) => m.id);

    const allSelected = pageIds.every((id) =>
      selectedMembers.includes(id)
    );

    if (allSelected) {
      setSelectedMembers((prev) =>
        prev.filter((id) => !pageIds.includes(id))
      );
    } else {
      setSelectedMembers((prev) => [
        ...prev,
        ...pageIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  // ACTIVATE (RETURN MEMBER)
  const handleActivate = async () => {
    let count = 0;

    for (const id of selectedMembers) {
      const member = members.find((m) => m.id === id);

      if (!member?.member_id) continue;

      try {
        await apiFetch(`/members/${member.member_id}/activate`, {
          method: "POST",
        });
        count++;
      } catch {
        console.warn("Failed to activate:", member.full_name);
      }
    }

    Swal.fire("Imefanikiwa", `${count} wamerudishwa`, "success");

    setMembers((prev) =>
      prev.filter((m) => !selectedMembers.includes(m.id))
    );

    setSelectedMembers([]);
  };

  //  DELETE
  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: "Una uhakika?",
      text: "Unataka kufuta kabisa?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ndiyo",
      cancelButtonText: "Hapana",
    });

    if (!confirm.isConfirmed) return;

    let count = 0;

    for (const id of selectedMembers) {
      const member = members.find((m) => m.id === id);

      if (!member?.member_id) continue;

      try {
        await apiFetch(`/members/${member.member_id}/delete-both`, {
          method: "DELETE",
        });
        count++;
      } catch {
        console.warn("Delete failed:", member.member_id);
      }
    }

    Swal.fire("Imefutwa", `${count} washirika wameondolewa`, "success");

    setMembers((prev) =>
      prev.filter((m) => !selectedMembers.includes(m.id))
    );

    setSelectedMembers([]);
  };




// EMPTY STATE


// EMPTY STATE
if (!loading && members.length === 0) {
  return (
    <div className="relative flex flex-col items-center justify-center py-24 overflow-hidden">

      {/* Background floating effects */}
      <div className="absolute w-72 h-72 rounded-full bg-gray-100 blur-3xl opacity-60 animate-pulse dark:bg-gray-800" />

      <div className="absolute top-16 left-1/3 w-6 h-6 rounded-full bg-gray-200 animate-bounce dark:bg-gray-700" />

      <div
        className="absolute bottom-20 right-1/3 w-4 h-4 rounded-full bg-gray-300 animate-bounce dark:bg-gray-600"
        style={{ animationDelay: "0.5s" }}
      />

      {/* Main icon */}
      <div className="relative z-10 flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-red-50 to-orange-50 dark:from-red-500/10 dark:to-orange-500/10">

        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg dark:bg-gray-900 animate-pulse">
          <UserX className="w-8 h-8 text-red-500" />
        </div>
      </div>

      {/* Text */}
      <h2 className="relative z-10 mt-8 text-2xl font-bold text-gray-800 dark:text-white">
        Hakuna waliokataliwa
      </h2>

      <p className="relative z-10 mt-3 max-w-md text-center text-sm leading-7 text-gray-500 dark:text-gray-400">
       Kwa sasa hakuna taarifa za washirika waliokataliwa.
      </p>
    </div>
  );
}

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
      {/* HEADER */}
<div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
  
  <h2 className="text-lg font-bold text-gray-800 dark:text-white/90">Waliokataliwa</h2>

  <div className="flex flex-wrap gap-2">

    {/* EXPORT EXCEL */}
    <button
      onClick={() => exportToExcel(filteredMembers, "waliokataliwa",)}
      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center gap-2 text-sm"
    >
      <FaFileExcel />
      Pakua Excel
    </button>

    {/* EXPORT PDF */}
    <button
      onClick={() => exportToPDF(filteredMembers, "waliokataliwa",)}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center gap-2 text-sm"
    >
      <FaFilePdf />
      Pakua PDF
    </button>

    {/* ACTIVATE */}
    <button
      onClick={handleActivate}
      disabled={selectedMembers.length === 0}
      className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
    >
      Rudisha
    </button>

    {/* DELETE */}
    <button
      onClick={handleDelete}
      disabled={selectedMembers.length === 0}
      className="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-50"
    >
      Futa
    </button>

  </div>
</div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-700 dark:text-gray-300">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="p-3">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    paginatedMembers.length > 0 &&
                    paginatedMembers.every((m) =>
                      selectedMembers.includes(m.id)
                    )
                  }
                />
              </th>
              <th className="p-3 text-left">Jina</th>
              <th className="p-3 text-left">Simu</th>
              <th className="p-3 text-left">Zone</th>
              <th className="p-3 text-left">Tarehe</th>
              <th className="p-3 text-left">Sababu ya Kuondolewa</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500 dark:text-gray-400">
                  Inapakia...
                </td>
              </tr>
            ) : paginatedMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500 dark:text-gray-400">
                  Hakuna matokeo
                </td>
              </tr>
            ) : (
              paginatedMembers.map((m) => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.04]">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(m.id)}
                      onChange={() => toggleSelect(m.id)}
                    />
                  </td>

                  <td className="p-3 font-medium">
                  {m.full_name?.toUpperCase()}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {m.membership_number || "—"}
                    </div>
                  </td>

                  <td className="p-3">{m.phone || "—"}</td>

                  <td className="p-3">
                    {m.residential_zone || "—"}
                  </td>

                  <td className="p-3">
                    {m.created_at
                      ? new Date(m.created_at).toLocaleDateString()
                      : "—"}
                  </td>

                       {/* Status */}
                <td className="p-3">
                <div className="flex items-center gap-2 text-yellow-600 font-bold dark:text-yellow-300">
                    <FaTimes />
                    {m.deactivation_reason || getMembershipStatusLabel(m.membership_status, statusLabels)}
                </div>
                </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center px-4 py-3 text-gray-700 dark:text-gray-300">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 dark:border-gray-700"
        >
          Prev
        </button>

        <span>
          Page {currentPage} / {totalPages || 1}
        </span>

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 dark:border-gray-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
