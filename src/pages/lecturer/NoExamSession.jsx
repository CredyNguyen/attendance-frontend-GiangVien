import { useState, useEffect } from "react";
import api from "../../api/client";

export default function NoExamSession() {
    const [examList, setExamList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // Phân trang server-side
    const PAGE_SIZE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10); // per_page thực tế từ API

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
        } finally {
            isFirst ? setLoading(false) : setTableLoading(false);
        }
    };

    // Lần đầu load
    useEffect(() => {
        fetchExams(1, "", "all", true);
    }, []);

    // Khi đổi trang
    useEffect(() => {
        fetchExams(currentPage, search, filterStatus);
    }, [currentPage]);

    // Khi search hoặc filter thay đổi → reset về trang 1
    useEffect(() => {
        setCurrentPage(1);
        fetchExams(1, search, filterStatus);
    }, [search, filterStatus]);

    const totalPages = Math.ceil(totalCount / perPage);

    const statusConfig = {
        upcoming: { label: "Sắp diễn ra", bg: "#eff6ff", color: "#1d4ed8" },
        ongoing:  { label: "Đang diễn ra", bg: "#dcfce7", color: "#15803d" },
        completed: { label: "Đã kết thúc", bg: "#f1f5f9", color: "#64748b" },
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "28px 20px", fontFamily: "'Segoe UI', sans-serif" }}>
            <style>{`
                .nes-card { background: white; border-radius: 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
                .nes-btn { border: none; border-radius: 9px; padding: 8px 18px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
                .nes-btn:hover { opacity: 0.85; }
                .nes-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
                .nes-table th { background: #f8fafc; color: #64748b; font-weight: 600; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em; padding: 11px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                .nes-table td { padding: 13px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
                .nes-table tr:last-child td { border-bottom: none; }
                .nes-table tr:hover td { background: #f8fafc; }
                .nes-search input { border: 1.5px solid #e2e8f0; border-radius: 9px; padding: 9px 14px; font-size: 14px; outline: none; transition: border-color 0.15s; }
                .nes-search input:focus { border-color: #3b82f6; }
                .nes-page-btn { border: none; border-radius: 9px; padding: 6px 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
                .nes-page-btn:disabled { opacity: 0.35; cursor: default; }
            `}</style>

            {/* ── BANNER ── */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                    Trạng thái
                </div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
                    Hiện không có ca thi đang diễn ra
                </h1>
            </div>

            <div className="nes-card" style={{ padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                    width: 44, height: 44, flexShrink: 0,
                    background: "#eff6ff", borderRadius: 12,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>Lịch thi được phân công</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
                        Dưới đây là toàn bộ các ca thi bạn đang phụ trách
                    </div>
                </div>
            </div>

            {/* ── BỘ LỌC ── */}
            <div className="nes-card" style={{ padding: "14px 18px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div className="nes-search">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm môn học, phòng thi..."
                        style={{ width: 240 }}
                    />
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                    {[
                        { v: "all", label: "Tất cả" },
                        { v: "upcoming", label: "Sắp diễn ra" },
                        { v: "completed", label: "Đã kết thúc" },
                    ].map(opt => (
                        <button
                            key={opt.v}
                            className="nes-btn"
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

            {/* ── BẢNG ── */}
            <div className="nes-card" style={{ overflow: "hidden" }}>
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
                    {loading ? (
                        <div style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                            Đang tải dữ liệu...
                        </div>
                    ) : examList.length === 0 ? (
                        <div style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                            Không tìm thấy ca thi nào
                        </div>
                    ) : (
                        <table className="nes-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Môn học</th>
                                    <th>Mã ca thi</th>
                                    <th>Ngày thi</th>
                                    <th>Giờ thi</th>
                                    <th>Phòng</th>
                                    <th>Thời lượng</th>
                                    <th>Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableLoading ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: "center", color: "#94a3b8", padding: "32px 0" }}>
                                            Đang tải...
                                        </td>
                                    </tr>
                                ) : examList.map((exam, i) => {
                                    const st = statusConfig[exam.status] || { label: exam.status || "—", bg: "#f1f5f9", color: "#64748b" };
                                    return (
                                        <tr key={exam.id || i}>
                                            <td style={{ color: "#94a3b8", fontWeight: 500 }}>
                                                {(currentPage - 1) * PAGE_SIZE + i + 1}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>
                                                    {exam.subject_name || exam.course_name || "—"}
                                                </div>
                                                {exam.subject_code && (
                                                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                                                        {exam.subject_code}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ color: "#64748b", fontWeight: 600 }}>
                                                {exam.session_code || exam.id || "—"}
                                            </td>
                                            <td style={{ color: "#64748b" }}>{exam.exam_date || exam.date || "—"}</td>
                                            <td style={{ color: "#64748b" }}>{exam.exam_time || exam.start_time || exam.start_at || "—"}</td>
                                            <td>
                                                <span style={{
                                                    display: "inline-block",
                                                    background: "#e0e7ff", color: "#3730a3",
                                                    borderRadius: 8, padding: "3px 10px",
                                                    fontSize: 13, fontWeight: 600,
                                                }}>
                                                    {exam.room || exam.room_name || "—"}
                                                </span>
                                            </td>
                                            <td style={{ color: "#64748b" }}>
                                                {exam.duration ? `${exam.duration} phút` : "—"}
                                            </td>
                                            <td style={{ color: "#64748b", fontSize: 13 }}>
                                                {exam.note || exam.notes || exam.remark || "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                    <div style={{
                        padding: "14px 20px", borderTop: "1px solid #f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                        <button className="nes-page-btn" style={{ background: "#f1f5f9", color: "#475569" }}
                            disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>«</button>
                        <button className="nes-page-btn" style={{ background: "#f1f5f9", color: "#475569" }}
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
                                <button key={item} className="nes-page-btn"
                                    style={{
                                        background: item === currentPage ? "#1e40af" : "#f1f5f9",
                                        color: item === currentPage ? "white" : "#475569",
                                    }}
                                    onClick={() => setCurrentPage(item)}
                                >{item}</button>
                            ))
                        }

                        <button className="nes-page-btn" style={{ background: "#f1f5f9", color: "#475569" }}
                            disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
                        <button className="nes-page-btn" style={{ background: "#f1f5f9", color: "#475569" }}
                            disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>»</button>
                    </div>
                )}
            </div>
        </div>
    );
}