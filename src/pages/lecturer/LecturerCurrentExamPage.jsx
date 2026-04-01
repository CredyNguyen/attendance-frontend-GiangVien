import React, { useEffect, useState } from "react";
import api from "../../api/client";
import "./LecturerCurrentExamPage.css";

export default function LecturerCurrentExamPage() {
    const [examData, setExamData] = useState(null);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentCode, setStudentCode] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch current exam data
                const response = await api.get("/lecturer/attendance/current");
                const { exam, students: studentData } = response.data.data;

                setExamData(exam);
                setStudents(studentData.data);
                setFilteredStudents(studentData.data);
            } catch (err) {
                console.error(err);
                setError("Không thể tải dữ liệu ca thi hoặc danh sách sinh viên. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearchStudent = (e) => {
        e.preventDefault();
        const code = e.target.studentCode.value.trim().toLowerCase();
        setStudentCode(code);

        if (!code) {
            setFilteredStudents(students);
            return;
        }

        const filtered = students.filter((sv) =>
            sv.student_code.toLowerCase().includes(code)
        );

        setFilteredStudents(filtered);
    };

    const handleFaceAttendance = () => {
        alert("Chức năng điểm danh bằng khuôn mặt chưa được triển khai.");
    };

    const handleQrAttendance = () => {
        alert("Chức năng điểm danh bằng QR code chưa được triển khai.");
    };

    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="lecturer-current-exam">
            <h1>Thông tin ca thi</h1>

            {examData ? (
                <>
                    <div className="exam-info">
                        <p><strong>Mã ca thi:</strong> {examData.id}</p>
                        <p><strong>Mã môn:</strong> {examData.subject_code}</p>
                        <p><strong>Môn học:</strong> {examData.subject_name}</p>
                        <p><strong>Ngày thi:</strong> {examData.exam_date}</p>
                        <p><strong>Giờ thi:</strong> {examData.exam_time}</p>
                        <p><strong>Thời lượng:</strong> {examData.duration} phút</p>
                        <p><strong>Phòng:</strong> {examData.room}</p>
                        <p><strong>Tổng SV:</strong> {examData.registered_count}</p>
                        <p><strong>Đã điểm danh:</strong> {examData.attended_count}</p>
                        <p><strong>Tỉ lệ:</strong> {examData.attendance_rate}%</p>
                    </div>

                    <div className="attendance-actions">
                        <button onClick={handleFaceAttendance}>Điểm danh khuôn mặt</button>
                        <button onClick={handleQrAttendance}>Điểm danh QR</button>
                    </div>

                    <form onSubmit={handleSearchStudent}>
                        <input name="studentCode" placeholder="Nhập mã SV..." />
                        <button type="submit">Tìm</button>
                    </form>

                    <h2>Danh sách sinh viên</h2>

                    <table className="student-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã SV</th>
                                <th>Họ tên</th>
                                <th>Lớp</th>
                                <th>Thời gian</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((sv, i) => (
                                    <tr key={sv.id}>
                                        <td>{i + 1}</td>
                                        <td>{sv.student_code}</td>
                                        <td>{sv.full_name}</td>
                                        <td>{sv.class_code}</td>
                                        <td>{sv.attendance_time || "-"}</td>
                                        <td>
                                            {sv.rekognition_result === "match"
                                                ? "Đã điểm danh"
                                                : "Chưa điểm danh"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6">Không có dữ liệu</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </>
            ) : (
                <p>Không có ca thi đang diễn ra.</p>
            )}
        </div>
    );
}