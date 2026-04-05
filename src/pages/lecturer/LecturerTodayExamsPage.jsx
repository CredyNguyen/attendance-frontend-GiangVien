import { useState, useEffect } from "react";
import api from "../../api/client";

export default function LecturerTodayExamsPage() {
    const [examList, setExamList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get("/lecturer/exam-schedules/today")
            .then(res => {
                const data = res.data?.data?.data || res.data?.data || res.data || [];
                setExamList(Array.isArray(data) ? data : []);
            })
            .catch(() => setError("Lỗi khi tải dữ liệu lịch thi hôm nay"))
            .finally(() => setLoading(false));
    }, []);

    const statusConfig = {
        upcoming:  { label: "Sắp diễn ra",  bg: "#eff6ff", color: "#1d4ed8" },
        ongoing:   { label: "Đang diễn ra",  bg: "#dcfce7", color: "#15803d" },
        completed: { label: "Đã kết thúc",   bg: "#f1f5f9", color: "#64748b" },
    };

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
                .lte-card { background: white; border-radius: 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
                .lte-stat-card { background: white; border-radius: 14px; padding: 20px 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
                .lte-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
                .lte-table th { background: #f8fafc; color: #64748b; font-weight: 600; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em; padding: 11px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                .lte-table td { padding: 13px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
                .lte-table tr:last-child td { border-bottom: none; }
                .lte-table tr:hover td { background: #f8fafc; }
            `}</style>

            {/* ── HEADER ── */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                    Hôm nay
                </div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
                    Lịch thi hôm nay
                </h1>
                <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>
                    Danh sách ca thi hôm nay của giảng viên.
                </p>
            </div>

            {/* ── STATS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
                {[
                    { label: "Tổng ca thi", value: examList.length },
                    { label: "Sắp diễn ra", value: examList.filter(e => e.status === "upcoming").length, highlight: true },
                    { label: "Đang diễn ra", value: examList.filter(e => e.status === "ongoing").length },
                    { label: "Đã kết thúc",  value: examList.filter(e => e.status === "completed").length },
                ].map((item, i) => (
                    <div key={i} className="lte-stat-card">
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                            {item.label}
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 700, color: item.highlight ? "#1e40af" : "#0f172a" }}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── BẢNG ── */}
            <div className="lte-card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                        Danh sách ca thi
                        <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 500, color: "#94a3b8" }}>
                            ({examList.length})
                        </span>
                    </h2>
                </div>

                <div style={{ overflowX: "auto" }}>
                    {examList.length === 0 ? (
                        <div style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                            Hôm nay bạn không có ca thi nào.
                        </div>
                    ) : (
                        <table className="lte-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Môn học</th>
                                    <th>Bắt đầu</th>
                                    <th>Kết thúc</th>
                                    <th>Phòng</th>
                                    <th>Số SV</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {examList.map((exam, i) => {
                                    const st = statusConfig[exam.status] || { label: exam.status || "—", bg: "#f1f5f9", color: "#64748b" };
                                    return (
                                        <tr key={exam.id || i}>
                                            <td style={{ color: "#94a3b8", fontWeight: 500 }}>{i + 1}</td>
                                            <td>
                                                <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>
                                                    {exam.subject_name || exam.course_name || exam.exam_name || "—"}
                                                </div>
                                                {exam.subject_code && (
                                                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                                                        {exam.subject_code}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ color: "#64748b", fontSize: 13 }}>
                                                {exam.start_time || exam.start_at || "—"}
                                            </td>
                                            <td style={{ color: "#64748b", fontSize: 13 }}>
                                                {exam.end_time || exam.end_at || "—"}
                                            </td>
                                            <td>
                                                <span style={{
                                                    display: "inline-block",
                                                    background: "#e0e7ff", color: "#3730a3",
                                                    borderRadius: 8, padding: "3px 10px",
                                                    fontSize: 13, fontWeight: 600,
                                                }}>
                                                    {exam.room || exam.room_name || exam.location || "—"}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600, color: "#1e293b" }}>
                                                {exam.student_count ?? exam.students_count ?? "—"}
                                            </td>
                                            <td>
                                                <span style={{
                                                    display: "inline-block",
                                                    borderRadius: 20, padding: "3px 12px",
                                                    fontSize: 12, fontWeight: 600,
                                                    background: st.bg, color: st.color,
                                                }}>
                                                    {st.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}