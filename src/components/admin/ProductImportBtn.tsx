'use client';
import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function ProductImportBtn() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus("Excel fayl o'qilmoqda...");

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const dataBuffer = evt.target?.result;
        const wb = XLSX.read(dataBuffer, { type: 'binary' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        setStatus(`${data.length} ta tovar bazaga yozilmoqda...`);

        const res = await fetch('/api/admin/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: data }),
        });

        const resData = await res.json();
        if (resData.success) {
          setStatus(`Muvaffaqiyatli! ${resData.count} ta tovar bazaga kiritildi.`);
        } else {
          setStatus(`Xatolik: ${resData.error}`);
        }
      } catch (err: any) {
        setStatus(`Xato yuz berdi: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex items-center gap-3">
      <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow transition">
        {loading ? "Yuklanmoqda..." : "📥 Excel Import"}
        <input 
          type="file" 
          accept=".xlsx, .xls, .json" 
          onChange={handleUpload} 
          disabled={loading} 
          className="hidden" 
        />
      </label>
      {status && <span className="text-sm text-gray-200">{status}</span>}
    </div>
  );
}