import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const useWashirikaExport = () => {

  const exportToExcel = (
  members: any[],
  fileName: string = "washirika"
) => {

  const activeMembers = members.filter(
    (m) => m.membership_status === "active"
  );

  const data = activeMembers.map((m, index) => ({
    "Na.": index + 1,
    Jina: (m.full_name || "").toUpperCase(),
    "Namba ya ushirika": m.membership_number || "—",
    "Namba ya simu": m.phone || "—",
    "Zone au Mtaa": m.residential_zone || "—",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

  const exportToPDF = (
  members: any[],
  fileName: string = "washirika"
) => {

  const activeMembers = members.filter(
    (m) => m.membership_status === "active"
  );

  const doc = new jsPDF();

  doc.text("Ripoti ya Washirika Hai", 14, 15);

  const tableData = activeMembers.map((m, index) => [
    index + 1,
   (m.full_name || "").toUpperCase(),
    m.membership_number || "—",
    m.phone || "—",
    m.residential_zone || "—",
  ]);

  autoTable(doc, {
    startY: 25,
    head: [[
      "Na.",
      "Jina",
      "Namba ya ushirika",
      "Namba ya simu",
      "Zone au Mtaa",
    ]],
    body: tableData,
  });

  doc.save(`${fileName}.pdf`);
};


  return {
    exportToExcel,
    exportToPDF,
  };
};