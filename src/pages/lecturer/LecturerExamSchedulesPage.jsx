import { useState, useEffect } from "react";
import api from "../../api/client";

export default function LecturerExamSchedulesPage() {
    const [examList, setExamList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const PAGE_SIZE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Lấy trang đầu để biết tổng số
                const first = await api.get(`/lecturer/exam-schedules?page=1&per_page=100`);
                const data = first.data?.data;
                let items = data?.data ?? (Array.isArray(data) ? data : []);
                const total = data?.total ?? items.length;
                const perPage = data?.per_page ?? 100;
                const totalPages = Math.ceil(total / perPage);

                // Nếu có nhiều trang hơn, fetch thêm
                if (totalPages > 1) {
                    const rest = await Promise.all(
                        Array.from({ length: totalPages - 1 }, (_, i) =>
                            api.get(`/lecturer/exam-schedules?page=${i + 2}&per_page=100`)
                        )
                    );
                    rest.forEach(res => {
                        const d = res.data?.data;
                        const chunk = d?.data ?? (Array.isArray(d) ? d : []);
                        items = [...items, ...chunk];
                    });
                }

                // Ưu tiên ca hôm nay lên đầu, giữ thứ tự ngày cho phần còn lại
                const sorted = [...items].sort((a, b) => {
                    const aToday = (a.exam_date || "").startsWith(today) ? 0 : 1;
                    const bToday = (b.exam_date || "").startsWith(today) ? 0 : 1;
                    if (aToday !== bToday) return aToday - bToday;
                    return (a.exam_date || "").localeCompare(b.exam_date || "");
                });

                const filteredData = sorted.filter(e => e.status !== "completed");

                setExamList(filteredData);
            } catch {
                setError("Lỗi khi tải dữ liệu lịch thi");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const filtered = examList.filter(exam => {
        // ❌ bỏ luôn ca đã kết thúc
        if (exam.status === "completed") return false;

        const q = search.toLowerCase();
        const matchSearch =
            (exam.subject_name || "").toLowerCase().includes(q) ||
            (exam.room || "").toLowerCase().includes(q) ||
            (exam.subject_code || "").toLowerCase().includes(q);

        const matchStatus =
            filterStatus === "all" || exam.status === filterStatus;

        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const todayCount = examList.filter(e => (e.exam_date || "").startsWith(today)).length;

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
                .les-table tr.today-row td { background: #fffbeb; border-left: 3px solid #f59e0b; }
                .les-table tr.today-row:hover td { background: #fef3c7; }
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

            {/* BANNER HÔM NAY */}
            {todayCount > 0 && (
                <div className="les-card" style={{
                    padding: "14px 20px", marginBottom: 16,
                    display: "flex", alignItems: "center", gap: 12,
                    borderLeft: "4px solid #f59e0b", background: "#fffbeb",
                }}>
                    <div style={{
                        width: 36, height: 36, flexShrink: 0,
                        background: "#fde68a", borderRadius: 10,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2.2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#92400e" }}>
                            Hôm nay bạn có {todayCount} ca thi
                        </div>
                        <div style={{ fontSize: 13, color: "#b45309", marginTop: 2 }}>
                            Các ca thi hôm nay được ưu tiên hiển thị đầu danh sách và đánh dấu màu vàng.
                        </div>
                    </div>
                </div>
            )}

            {/* BỘ LỌC */}
            <div className="les-card" style={{ padding: "14px 18px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div className="les-search">
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                        placeholder="Tìm môn học, phòng thi..."
                        style={{ width: 240 }}
                    />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                    {[
                        { v: "all", label: "Tất cả" },
                        { v: "upcoming", label: "Sắp diễn ra" },
                    ].map(opt => (
                        <button
                            key={opt.v}
                            className="les-btn"
                            onClick={() => { setFilterStatus(opt.v); setCurrentPage(1); }}
                            style={{
                                background: filterStatus === opt.v ? "#1e40af" : "#f1f5f9",
                                color: filterStatus === opt.v ? "white" : "#475569",
                            }}
                        >{opt.label}</button>
                    ))}
                </div>
                <span style={{ marginLeft: "auto", fontSize: 13, color: "#94a3b8" }}>
                    {filtered.length} ca thi
                </span>
            </div>

            {/* BẢNG */}
            <div className="les-card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                        Danh sách lịch thi
                        <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 500, color: "#94a3b8" }}>
                            ({filtered.length})
                        </span>
                    </h2>
                    {totalPages > 1 && (
                        <span style={{ fontSize: 13, color: "#64748b" }}>
                            Trang {currentPage} / {totalPages}
                        </span>
                    )}
                </div>

                <div style={{ overflowX: "auto" }}>
                    {paginated.length === 0 ? (
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
                                {paginated.map((exam, i) => {
                                    const isToday = (exam.exam_date || "").startsWith(today);
                                    return (
                                        <tr key={exam.id || i} className={isToday ? "today-row" : ""}>
                                            <td style={{ color: "#94a3b8", fontWeight: 500 }}>
                                                {(currentPage - 1) * PAGE_SIZE + i + 1}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                                                    {exam.subject_name || "—"}
                                                    {isToday && (
                                                        <span style={{
                                                            fontSize: 11, fontWeight: 700,
                                                            background: "#f59e0b", color: "white",
                                                            borderRadius: 6, padding: "1px 7px",
                                                        }}>Hôm nay</span>
                                                    )}
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
                                            <td style={{ color: isToday ? "#92400e" : "#64748b", fontWeight: isToday ? 700 : 400 }}>
                                                {exam.exam_date || "—"}
                                            </td>
                                            <td style={{ color: "#64748b" }}>
                                                {exam.duration ? `${exam.duration} phút` : "—"}
                                            </td>
                                            <td>
                                                <span style={{
                                                    display: "inline-block",
                                                    background: isToday ? "#fde68a" : "#e0e7ff",
                                                    color: isToday ? "#92400e" : "#3730a3",
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
                                    );
                                })}
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