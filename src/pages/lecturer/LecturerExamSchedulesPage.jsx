import { useState, useEffect } from "react";
import api from "../../api/client";

export default function LecturerExamSchedulesPage() {
    const [examList, setExamList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const PAGE_SIZE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);

    const fetchExams = async (page, searchVal, statusVal, isFirst = false) => {
        isFirst ? setLoading(true) : setTableLoading(true);
        try {
            const params = new URLSearchParams({ page, per_page: PAGE_SIZE });
            if (searchVal) params.append("search", searchVal);
            if (statusVal && statusVal !== "all") params.append("status", statusVal);

            const res = await api.get(`/lecturer/exam-schedules?${params.toString()}`);
            const studentData = res.data?.data;
            const items = studentData?.data ?? (Array.isArray(studentData) ? studentData : []);
            const total = studentData?.total ?? items.length;
            const actualPerPage = studentData?.per_page ?? PAGE_SIZE;
            setExamList(items);
            setTotalCount(total);
            setPerPage(actualPerPage);
        } catch {
            setExamList([]);
            setTotalCount(0);
            setError("Lỗi khi tải dữ liệu lịch thi");
        } finally {
            isFirst ? setLoading(false) : setTableLoading(false);
        }
    };

    useEffect(() => { fetchExams(1, "", "all", true); }, []);
    useEffect(() => { fetchExams(currentPage, search, filterStatus); }, [currentPage]);
    useEffect(() => {
        setCurrentPage(1);
        fetchExams(1, search, filterStatus);
    }, [search, filterStatus]);

    const totalPages = Math.ceil(totalCount / perPage);

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#64748b", fontSize: 15 }}>
            Đang tải dữ liệu...
        </div>
    );
    if (error) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#dc2626", fontSize: 15 }}>
            {error}
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "28px 20px", fontFamily: "'Segoe UI', sans-serif" }}>
            <style>{`
                .les-card { background: white; border-radius: 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
                .les-btn { border: none; border-radius: 9px; padding: 8px 18px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
                .les-btn:hover { opacity: 0.85; }
                .les-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
                .les-table th { background: #f8fafc; color: #64748b; font-weight: 600; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em; padding: 11px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                .les-table td { padding: 13px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
                .les-table tr:last-child td { border-bottom: none; }
                .les-table tr:hover td { background: #f8fafc; }
                .les-search input { border: 1.5px solid #e2e8f0; border-radius: 9px; padding: 9px 14px; font-size: 14px; outline: none; transition: border-color 0.15s; }
                .les-search input:focus { border-color: #3b82f6; }
                .les-page-btn { border: none; border-radius: 9px; padding: 6px 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
                .les-page-btn:disabled { opacity: 0.35; cursor: default; }
            `}</style>

            {/* HEADER */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                    Lịch thi
                </div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
                    Lịch thi được phân công
                </h1>
                <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>
                    Tổng hợp các lịch thi mà giảng viên đang phụ trách.
                </p>
            </div>

            {/* BỘ LỌC */}
            <div className="les-card" style={{ padding: "14px 18px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div className="les-search">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm môn học, phòng thi..."
                        style={{ width: 240 }}
                    />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                    {[
                        { v: "all",       label: "Tất cả" },
                        { v: "upcoming",  label: "Sắp diễn ra" },
                        { v: "completed", label: "Đã kết thúc" },
                    ].map(opt => (
                        <button
                            key={opt.v}
                            className="les-btn"
                            onClick={() => setFilterStatus(opt.v)}
                            style={{
                                background: filterStatus === opt.v ? "#1e40af" : "#f1f5f9",
                                color: filterStatus === opt.v ? "white" : "#475569",
                            }}
                        >{opt.label}</button>
                    ))}
                </div>
                <span style={{ marginLeft: "auto", fontSize: 13, color: "#94a3b8" }}>
                    {totalCount} ca thi
                </span>
            </div>

            {/* BẢNG */}
            <div className="les-card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                        Danh sách lịch thi
                        <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 500, color: "#94a3b8" }}>
                            ({totalCount})
                        </span>
                    </h2>
                    {totalPages > 1 && (
                        <span style={{ fontSize: 13, color: "#64748b" }}>
                            Trang {currentPage} / {totalPages}
                        </span>
                    )}
                </div>

                <div style={{ overflowX: "auto" }}>
                    {tableLoading ? (
                        <div style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                            Đang tải...
                        </div>
                    ) : examList.length === 0 ? (
                        <div style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                            Bạn chưa được phân công lịch thi nào.
                        </div>
                    ) : (
                        <table className="les-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Môn học</th>
                                    <th>Mã ca thi</th>
                                    <th>Ngày thi</th>
                                    <th>Thời lượng</th>
                                    <th>Phòng</th>
                                    <th>Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {examList.map((exam, i) => (
                                    <tr key={exam.id || i}>
                                        <td style={{ color: "#94a3b8", fontWeight: 500 }}>
                                            {(currentPage - 1) * PAGE_SIZE + i + 1}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>
                                                {exam.subject_name || "—"}
                                            </div>
                                            {exam.subject_code && (
                                                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                                                    {exam.subject_code}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ color: "#1e40af", fontWeight: 700 }}>
                                            {exam.id || "—"}
                                        </td>
                                        <td style={{ color: "#64748b" }}>
                                            {exam.exam_date || "—"}
                                        </td>
                                        <td style={{ color: "#64748b" }}>
                                            {exam.duration ? `${exam.duration} phút` : "—"}
                                        </td>
                                        <td>
                                            <span style={{
                                                display: "inline-block",
                                                background: "#e0e7ff", color: "#3730a3",
                                                borderRadius: 8, padding: "3px 10px",
                                                fontSize: 13, fontWeight: 600,
                                            }}>
                                                {exam.room || "—"}
                                            </span>
                                        </td>
                                        <td style={{ color: "#64748b", fontSize: 13 }}>
                                            {exam.note || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* PHÂN TRANG */}
                {totalPages > 1 && (
                    <div style={{
                        padding: "14px 20px", borderTop: "1px solid #f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                        <button className="les-page-btn" style={{ background: "#f1f5f9", color: "#475569" }}
                            disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>«</button>
                        <button className="les-page-btn" style={{ background: "#f1f5f9", color: "#475569" }}
                            disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .reduce((acc, p, idx, arr) => {
                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((item, idx) => item === "..." ? (
                                <span key={`e-${idx}`} style={{ padding: "6px 4px", color: "#94a3b8", fontSize: 13 }}>...</span>
                            ) : (
                                <button key={item} className="les-page-btn"
                                    style={{
                                        background: item === currentPage ? "#1e40af" : "#f1f5f9",
                                        color: item === currentPage ? "white" : "#475569",
                                    }}
                                    onClick={() => setCurrentPage(item)}
                                >{item}</button>
                            ))
                        }

                        <button className="les-page-btn" style={{ background: "#f1f5f9", color: "#475569" }}
                            disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
                        <button className="les-page-btn" style={{ background: "#f1f5f9", color: "#475569" }}
                            disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>»</button>
                    </div>
                )}
            </div>
        </div>
    );
}