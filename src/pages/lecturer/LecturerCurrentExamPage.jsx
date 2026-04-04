import React, { useEffect, useState, useRef } from "react";
import api from "../../api/client";
import "./LecturerCurrentExamPage.css";

export default function LecturerCurrentExamPage() {
    const [examData, setExamData] = useState(null);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentCode, setStudentCode] = useState("");

    // 👉 camera state
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get("/lecturer/attendance/current");
                const { exam, students: studentData } = response.data.data;

                setExamData(exam);
                setStudents(studentData.data);
                setFilteredStudents(studentData.data);
            } catch (err) {
                console.error(err);
                setError("Không thể tải dữ liệu ca thi hoặc danh sách sinh viên.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearchStudent = (e) => {
        e.preventDefault();
        const code = e.target.studentCode.value.trim().toLowerCase();

        if (!code) {
            setFilteredStudents(students);
            return;
        }

        const filtered = students.filter((sv) =>
            sv.student_code.toLowerCase().includes(code)
        );

        setFilteredStudents(filtered);
    };

    // 🎥 mở camera
    const handleFaceAttendance = async () => {
        try {
            setIsCameraOpen(true);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" }
            });

            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        } catch (err) {
            console.error(err);
            alert("Không mở được camera");
        }
    };

    // ❌ đóng camera
    const closeCamera = () => {
        setIsCameraOpen(false);
        setCapturedImage(null);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    // 📸 chụp ảnh
    const handleCapture = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, 640, 480);

        const base64 = canvas.toDataURL("image/jpeg");
        setCapturedImage(base64);
    };

    // 🔁 chụp lại
    const handleRetake = () => {
        setCapturedImage(null);
    };

    // 🔥 VERIFY (ĐÃ FIX CHUẨN BACKEND)
    const handleVerify = async () => {
        try {
            if (!capturedImage) {
                alert("Vui lòng chụp ảnh trước");
                return;
            }

            // ✅ gửi base64 (KHÔNG dùng FormData)
            const res = await api.post("/lecturer/attendance/face-recognition", {
                image: capturedImage,
                exam_schedule_id: examData.id
            });

            console.log("FACE:", res.data);

            if (!res.data.success) {
                alert(res.data.message || "Không nhận diện được");
                return;
            }

            const attendance = res.data.data.attendance;
            const student = res.data.data.student;

            const attendanceId = attendance.id;
            const studentCode = student.student_code;

            // ✅ update record đúng
            await api.patch(`/lecturer/attendance-records/${attendanceId}`);

            alert("Điểm danh thành công");

            // ✅ update UI theo student_code
            const updated = students.map((sv) =>
                sv.student_code === studentCode
                    ? {
                          ...sv,
                          rekognition_result: "match",
                          attendance_time: attendance.attendance_time
                      }
                    : sv
            );

            setStudents(updated);
            setFilteredStudents(updated);

            closeCamera();
        } catch (err) {
            console.error(err);
            alert("Lỗi khi nhận diện khuôn mặt");
        }
    };

    const handleQrAttendance = () => {
        alert("Chức năng QR chưa làm");
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
                        <button onClick={handleFaceAttendance}>
                            Điểm danh khuôn mặt
                        </button>
                        <button onClick={handleQrAttendance}>
                            Điểm danh QR
                        </button>
                    </div>

                    {/* 🎥 CAMERA */}
                    {isCameraOpen && (
                        <div className="camera-modal">
                            <video
                                ref={videoRef}
                                autoPlay
                                width="400"
                                style={{ display: capturedImage ? "none" : "block" }}
                            />

                            {capturedImage && (
                                <img src={capturedImage} alt="preview" width="400" />
                            )}

                            <canvas
                                ref={canvasRef}
                                width={640}
                                height={480}
                                style={{ display: "none" }}
                            />

                            <div>
                                {!capturedImage && (
                                    <button onClick={handleCapture}>Chụp</button>
                                )}

                                {capturedImage && (
                                    <>
                                        <button onClick={handleRetake}>Chụp lại</button>
                                        <button onClick={handleVerify}>Kiểm tra</button>
                                    </>
                                )}

                                <button onClick={closeCamera}>Đóng</button>
                            </div>
                        </div>
                    )}

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