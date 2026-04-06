import * as faceapi from "face-api.js";
import React, { useEffect, useState, useRef } from "react";
import api from "../../api/client";

export default function LecturerCurrentExamPage() {
    const [examData, setExamData] = useState(null);
    // const [examData, setExamData] = useState({
    //     id: "TEST_001",
    //     subject_code: "IT3190",
    //     subject_name: "Lập trình Web",
    //     exam_date: "2025-06-10",
    //     exam_time: "07:00 - 09:00",
    //     duration: 120,
    //     room: "B1-101",
    //     registered_count: 42,
    //     attended_count: 5,
    //     attendance_rate: 12,
    // });
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    // { type: "success" | "error", message: "" }
    const toastTimerRef = useRef(null);
    // Tra cứu sinh viên
    const [lookupCode, setLookupCode] = useState("");
    const [lookupResult, setLookupResult] = useState(null);  // null | { status, data } | { status: "error", msg }
    const [lookupLoading, setLookupLoading] = useState(false);

    // Phân trang
    const PAGE_SIZE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [tableLoading, setTableLoading] = useState(false);

    // Sort
    const [sortBy, setSortBy] = useState(null); // null | "full_name" | "class_code"
    const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"

    const handleSort = (col) => {
        if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortBy(col); setSortDir("asc"); }
    };

    // camera khuôn mặt
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [faceError, setFaceError] = useState("");
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const [cameraFacingMode, setCameraFacingMode] = useState("user");
    // "user" = camera trước
    // "environment" = camera sau


    // QR scanner
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [qrResult, setQrResult] = useState(null);   // null | { mssv, status, name, msg }
    const [qrScanning, setQrScanning] = useState(false);
    const qrVideoRef = useRef(null);
    const qrCanvasRef = useRef(null);        // canvas hiển thị overlay (trong DOM)
    const qrOffscreenRef = useRef(null);     // canvas ẩn để decode QR (không gắn DOM)
    const qrStreamRef = useRef(null);
    const qrIntervalRef = useRef(null);
    const [successPopup, setSuccessPopup] = useState(null); // { name, mssv } | null
    const successTimerRef = useRef(null);
    const [errorPopup, setErrorPopup] = useState(null);     // { msg, mssv } | null
    const errorTimerRef = useRef(null);

    // Fetch thông tin exam lần đầu (không phụ thuộc trang)
    useEffect(() => {
        const fetchExam = async () => {
            try {
                const response = await api.get(`/lecturer/attendance/current?page=1&per_page=${PAGE_SIZE}`);
                const { exam, students: studentData } = response.data.data;
                setExamData(exam);
                setStudents(studentData.data);
                setFilteredStudents(studentData.data);
                setTotalCount(studentData.total ?? studentData.data.length);
            } catch (err) {
                if (err.response?.status === 404) {
                    setExamData(null);
                } else {
                    setError("Lỗi kết nối server: " + (err.response?.status || err.message));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, []);
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL =
                    "/models/face-api.js-models-master/tiny_face_detector";

                console.log("Loading model from:", MODEL_URL);

                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

                console.log("Face model loaded");
            } catch (err) {
                console.error("Load model failed:", err);
            }
        };

        loadModels();
    }, []);
    // Fetch danh sách sinh viên khi đổi trang
    useEffect(() => {
        if (currentPage === 1) return; // trang 1 đã fetch ở trên
        const fetchStudents = async () => {
            setTableLoading(true);
            try {
                const response = await api.get(`/lecturer/attendance/current?page=${currentPage}&per_page=${PAGE_SIZE}`);
                const { students: studentData } = response.data.data;
                setStudents(studentData.data);
                setFilteredStudents(studentData.data);
                setTotalCount(studentData.total ?? studentData.data.length);
            } catch (err) {
                setError("Lỗi kết nối server: " + (err.response?.status || err.message));
            } finally {
                setTableLoading(false);
            }
        };
        fetchStudents();
    }, [currentPage]);

    // ─── TRA CỨU SINH VIÊN ──────────────────────────────────────
    const handleLookup = async (e) => {
        e.preventDefault();
        const code = lookupCode.trim();
        if (!code) return;
        setLookupLoading(true);
        setLookupResult(null);
        try {
            const res = await api.get(`/lecturer/students/today-exam?student_code=${code}`);
            setLookupResult({ status: "ok", hasExam: res.data.has_exam, data: res.data.data, message: res.data.message });
        } catch (err) {
            const msg = err.response?.data?.message || "Không tìm thấy sinh viên";
            setLookupResult({ status: "error", msg });
        } finally {
            setLookupLoading(false);
        }
    };

    // ─── CAMERA KHUÔN MẶT ───────────────────────────────────────
    const faceIntervalRef = useRef(null);
    const showToast = (type, message) => {
        setToast({ type, message });

        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
            setToast(null);
        }, 2500);
    };
    const stopStream = (stream) => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const startCamera = async (facingMode = cameraFacingMode) => {
        try {
            setFaceError("");
            setIsFaceDetected(false);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode,
                    width: 640,
                    height: 480
                }
            });

            streamRef.current = stream;

            const video = videoRef.current;
            if (!video) return;

            video.srcObject = stream;

            video.onloadedmetadata = async () => {
                await video.play();

                const scanFace = async () => {
                    if (!videoRef.current || !canvasRef.current) return;

                    const canvas = canvasRef.current;

                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    const detections = await faceapi.detectAllFaces(
                        video,
                        new faceapi.TinyFaceDetectorOptions()
                    );

                    const ctx = canvas.getContext("2d");
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    if (detections.length > 0) {
                        setIsFaceDetected(true);
                        setFaceError("");

                        const resizedDetections = faceapi.resizeResults(
                            detections,
                            {
                                width: video.videoWidth,
                                height: video.videoHeight
                            }
                        );

                        faceapi.draw.drawDetections(
                            canvas,
                            resizedDetections
                        );
                    } else {
                        setIsFaceDetected(false);
                        setFaceError(
                            "Không nhận diện được khuôn mặt"
                        );
                    }

                    faceIntervalRef.current = setTimeout(scanFace, 300);
                };

                startFaceDetection();
            };
        } catch (err) {
            console.error(err);
            showToast("error", "Không mở được camera");

        }
    };

    const handleFaceAttendance = async () => {
        setCapturedImage(null);
        setIsCameraOpen(true);

        setTimeout(() => {
            startCamera();
        }, 100);
    };
    const handleSwitchCamera = async () => {
        const newMode =
            cameraFacingMode === "user"
                ? "environment"
                : "user";

        setCameraFacingMode(newMode);

        stopStream(streamRef.current);

        if (faceIntervalRef.current) {
            clearTimeout(faceIntervalRef.current);
        }

        setTimeout(() => {
            startCamera(newMode);
        }, 100);
    };

    const closeCamera = () => {
        setIsCameraOpen(false);
        setCapturedImage(null);

        stopStream(streamRef.current);

        if (faceIntervalRef.current) {
            clearTimeout(faceIntervalRef.current);
        }
    };
    const handleCapture = () => {
        if (!isFaceDetected) {
            setFaceError(
                "Không nhận diện được khuôn mặt, vui lòng căn chỉnh và thử lại"
            );
            return;
        }

        const video = videoRef.current;
        const canvas = document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        setCapturedImage(canvas.toDataURL("image/jpeg"));
    };
    const startFaceDetection = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        const scanFace = async () => {
            if (!videoRef.current || !canvasRef.current) return;

            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            canvas.width = videoWidth;
            canvas.height = videoHeight;

            const detections = await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions()
            );

            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (detections.length > 0) {
                setIsFaceDetected(true);
                setFaceError("");

                const resizedDetections = faceapi.resizeResults(detections, {
                    width: videoWidth,
                    height: videoHeight
                });

                faceapi.draw.drawDetections(canvas, resizedDetections);
            } else {
                setIsFaceDetected(false);
                setFaceError("Không nhận diện được khuôn mặt");
            }

            faceIntervalRef.current = setTimeout(scanFace, 300);
        };

        scanFace();
    };
    const handleRetake = () => {
        setCapturedImage(null);

        setTimeout(() => {
            startCamera(cameraFacingMode);
        }, 100);
    };

    const handleVerify = async () => {
        try {
            if (!capturedImage) { showToast("error", "Vui lòng chụp ảnh trước"); return; }
            const res = await api.post("/lecturer/attendance/face-recognition", {
                image: capturedImage,
                exam_schedule_id: examData.id
            });
            if (!res.data.success) { showToast("error", res.data.message || "Không nhận diện được"); return; }
            const attendance = res.data.data.attendance;
            const student = res.data.data.student;
            await api.patch(`/lecturer/attendance-records/${attendance.id}`);
            showToast("success", "Điểm danh thành công");
            const updated = students.map(sv =>
                sv.student_code === student.student_code
                    ? { ...sv, rekognition_result: "match", attendance_time: attendance.attendance_time }
                    : sv
            );
            setStudents(updated);
            setFilteredStudents(updated);
            closeCamera();
        } catch (err) {
            console.error(err);

            showToast("error", "Lỗi khi nhận diện khuôn mặt");
        }
    };

    // ─── QR SCANNER ─────────────────────────────────────────────
    const handleQrAttendance = async () => {
        setIsQrOpen(true);
        setQrResult(null);

        // Tạo canvas ẩn để decode — không gắn vào DOM nên không bị ảnh hưởng bởi React render
        if (!qrOffscreenRef.current) {
            qrOffscreenRef.current = document.createElement("canvas");
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }   // camera sau để quét thẻ
            });
            qrStreamRef.current = stream;
            // đợi modal render xong rồi mới gán stream
            setTimeout(() => {
                if (qrVideoRef.current) {
                    qrVideoRef.current.srcObject = stream;
                    qrVideoRef.current.play();
                    setQrScanning(true);
                    startQrScan();
                }
            }, 300);
        } catch (err) {
            showToast("error", "Không mở được camera: " + err.message);
            setIsQrOpen(false);
        }
    };
    const drawQrBox = (location, ctx) => {
        ctx.beginPath();
        ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
        ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y);
        ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
        ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
        ctx.closePath();

        // Nền xanh nhạt bên trong
        ctx.fillStyle = "rgba(34, 197, 94, 0.25)";
        ctx.fill();

        // Viền xanh lá
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#22c55e";
        ctx.stroke();
    };

    const startQrScan = () => {
        if (qrVideoRef.current && qrVideoRef.current.paused) {
            qrVideoRef.current.play().catch(() => { });
        }

        clearInterval(qrIntervalRef.current);
        qrIntervalRef.current = setInterval(async () => {
            const video = qrVideoRef.current;
            if (!video || video.readyState < 2) return;

            const w = video.videoWidth;
            const h = video.videoHeight;
            if (!w || !h) return;

            // ── Canvas ẩn: chỉ dùng để decode QR ──
            const offscreen = qrOffscreenRef.current;
            offscreen.width = w;
            offscreen.height = h;
            const offCtx = offscreen.getContext("2d");
            offCtx.drawImage(video, 0, 0, w, h);
            const imageData = offCtx.getImageData(0, 0, w, h);

            try {
                const jsQR = (await import("jsqr")).default;
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    clearInterval(qrIntervalRef.current);
                    setQrScanning(false);

                    // Vẽ khung xanh lên overlay canvas (nếu còn trong DOM)
                    if (qrCanvasRef.current) {
                        const ovCtx = qrCanvasRef.current.getContext("2d");
                        qrCanvasRef.current.width = w;
                        qrCanvasRef.current.height = h;
                        ovCtx.clearRect(0, 0, w, h);
                        drawQrBox(code.location, ovCtx);
                    }

                    setTimeout(() => handleQrFound(code.data), 300);
                }
            } catch {
                clearInterval(qrIntervalRef.current);
                showToast("error", "Thiếu thư viện jsqr. Chạy: npm install jsqr");
            }
        }, 200);
    };

    const handleQrFound = async (qrData) => {
        console.log("QR RAW:", qrData);

        // 🔥 xử lý format QR
        let processed = qrData;

        if (qrData.startsWith("SV:")) {
            processed = qrData.replace(/^SV:/i, "").trim();
        }

        setQrResult({ mssv: processed, status: "loading" });

        // Xóa khung xanh ngay khi bắt đầu xử lý
        const clearOverlay = () => {
            if (qrCanvasRef.current) {
                const ctx = qrCanvasRef.current.getContext("2d");
                ctx.clearRect(0, 0, qrCanvasRef.current.width, qrCanvasRef.current.height);
            }
        };

        try {
            const res = await api.post("/lecturer/attendance/qr-scan", {
                qr_content: processed,   // 🔥 gửi đúng format
                exam_schedule_id: examData.id,
            });

            if (res.data.success) {
                const student = res.data.data?.student;

                const updatedStudents = students.map(sv =>
                    sv.student_code === (student?.student_code || processed)
                        ? { ...sv, rekognition_result: "match", attendance_time: new Date().toLocaleTimeString("vi-VN") }
                        : sv
                );
                setStudents(updatedStudents);
                setFilteredStudents(updatedStudents);

                clearOverlay();
                setQrResult(null);
                setSuccessPopup({ name: student?.full_name, mssv: student?.student_code || processed });
                clearTimeout(successTimerRef.current);
                successTimerRef.current = setTimeout(() => {
                    setSuccessPopup(null);
                    setTimeout(() => { setQrScanning(true); startQrScan(); }, 100);
                }, 2500);
            } else {
                clearOverlay();
                setQrResult(null);
                setErrorPopup({ msg: res.data.message, mssv: processed });
                clearTimeout(errorTimerRef.current);
                errorTimerRef.current = setTimeout(() => {
                    setErrorPopup(null);
                    setTimeout(() => { setQrScanning(true); startQrScan(); }, 100);
                }, 2500);
            }
        } catch (err) {
            console.error(err.response?.data);
            clearOverlay();
            setQrResult(null);
            setErrorPopup({ msg: err.response?.data?.message || "Lỗi server", mssv: processed });
            clearTimeout(errorTimerRef.current);
            errorTimerRef.current = setTimeout(() => {
                setErrorPopup(null);
                setTimeout(() => { setQrScanning(true); startQrScan(); }, 100);
            }, 2500);
        }
    };

    const closeQr = () => {
        setIsQrOpen(false);
        setQrResult(null);
        setQrScanning(false);
        setSuccessPopup(null);
        setErrorPopup(null);
        clearTimeout(successTimerRef.current);
        clearTimeout(errorTimerRef.current);
        clearInterval(qrIntervalRef.current);
        if (qrStreamRef.current) qrStreamRef.current.getTracks().forEach(t => t.stop());
    };

    const scanAgain = () => {
        setQrResult(null);
        setQrScanning(true);
        startQrScan();
    };

    // ─── RENDER ──────────────────────────────────────────────────
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

    const attendanceRate = examData?.attendance_rate ?? 0;

    return (
        <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "28px 20px", fontFamily: "'Segoe UI', sans-serif" }}>
            <style>{`
                .lce-card { background: white; border-radius: 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
                .lce-info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0; }
                .lce-info-item { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; }
                .lce-info-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .lce-info-value { font-size: 14px; font-weight: 600; color: #1e293b; }
                .lce-stat-card { background: white; border-radius: 14px; padding: 20px 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
                .lce-btn { border: none; border-radius: 9px; padding: 11px 22px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.15s, transform 0.1s; }
                .lce-btn:hover { opacity: 0.88; transform: translateY(-1px); }
                .lce-btn:active { transform: translateY(0); }
                .lce-btn-primary { background: #1e40af; color: white; }
                .lce-btn-secondary { background: #0f766e; color: white; }
                .lce-btn-ghost { background: #f1f5f9; color: #475569; }
                .lce-search input { border: 1.5px solid #e2e8f0; border-radius: 9px; padding: 9px 14px; font-size: 14px; outline: none; transition: border-color 0.15s; width: 220px; }
                .lce-search input:focus { border-color: #3b82f6; }
                .lce-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
                .lce-table th { background: #f8fafc; color: #64748b; font-weight: 600; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em; padding: 11px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                .lce-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
                .lce-table tr:last-child td { border-bottom: none; }
                .lce-table tr:hover td { background: #f8fafc; }
                .badge-done { display: inline-block; background: #dcfce7; color: #15803d; border-radius: 20px; padding: 3px 11px; font-size: 12px; font-weight: 600; }
                .badge-pending { display: inline-block; background: #fef9c3; color: #92400e; border-radius: 20px; padding: 3px 11px; font-size: 12px; font-weight: 600; }
                .progress-bar-bg { background: #e2e8f0; border-radius: 99px; height: 8px; overflow: hidden; }
                .progress-bar-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #3b82f6, #06b6d4); transition: width 0.6s ease; }
                @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(-14px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
                @keyframes scanLine { 0%{top:4px} 50%{top:152px} 100%{top:4px} }
            `}</style>

            {examData ? (
                <>
                    {/* ── HEADER ── */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                            Ca thi đang diễn ra
                        </div>
                        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
                            {examData.subject_name}
                            <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 500, color: "#64748b" }}>
                                — {examData.subject_code}
                            </span>
                        </h1>
                    </div>

                    {/* ── STATS ROW ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
                        {[
                            { label: "Phòng thi", value: examData.room },
                            { label: "Ngày thi", value: examData.exam_date },
                            { label: "Giờ thi", value: examData.exam_time },
                            { label: "Thời lượng", value: `${examData.duration} phút` },
                            { label: "Tổng sinh viên", value: examData.registered_count },
                            { label: "Đã điểm danh", value: examData.attended_count, highlight: true },
                        ].map((item, i) => (
                            <div key={i} className="lce-stat-card">
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{item.label}</div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: item.highlight ? "#1e40af" : "#0f172a" }}>{item.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── PROGRESS ── */}
                    <div className="lce-card" style={{ padding: "18px 24px", marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Tỉ lệ điểm danh</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#1e40af" }}>{attendanceRate}%</span>
                        </div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${attendanceRate}%` }} />
                        </div>
                    </div>

                    {/* ── ACTIONS ── */}
                    <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                        <button className="lce-btn lce-btn-primary" onClick={handleFaceAttendance}>
                            Điểm danh khuôn mặt
                        </button>
                        <button className="lce-btn lce-btn-secondary" onClick={handleQrAttendance}>
                            Điểm danh QR
                        </button>
                    </div>

                    {/* ── CAMERA KHUÔN MẶT ── */}
                    {isCameraOpen && (
                        <div style={{
                            position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
                            zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <div
                                className="lce-card"
                                style={{ width: "min(440px,94vw)", overflow: "hidden" }}
                            >
                                <div
                                    style={{
                                        background: "linear-gradient(135deg,#1e40af,#3b82f6)",
                                        padding: "16px 20px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "white",
                                            fontWeight: 700,
                                            fontSize: 15
                                        }}
                                    >
                                        Điểm danh khuôn mặt
                                    </span>

                                    <button
                                        className="lce-btn"
                                        onClick={closeCamera}
                                        style={{
                                            background: "rgba(255,255,255,0.2)",
                                            color: "white",
                                            padding: "5px 14px",
                                            fontSize: 13
                                        }}
                                    >
                                        Đóng
                                    </button>
                                </div>

                                <div
                                    style={{
                                        position: "relative",
                                        width: "100%",
                                        height: 280,
                                        borderRadius: 10,
                                        overflow: "hidden",
                                        marginBottom: 14
                                    }}
                                >
                                    {/* VIDEO luôn tồn tại */}
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        style={{
                                            width: "100%",
                                            height: 280,
                                            objectFit: "cover",
                                            display: capturedImage ? "none" : "block"
                                        }}
                                    />

                                    {/* Canvas nhận diện mặt */}
                                    <canvas
                                        ref={canvasRef}
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            width: "100%",
                                            height: "100%",
                                            pointerEvents: "none",
                                            display: capturedImage ? "none" : "block"
                                        }}
                                    />

                                    {/* Ảnh preview khi chụp */}
                                    {capturedImage && (
                                        <img
                                            src={capturedImage}
                                            alt="preview"
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                zIndex: 10
                                            }}
                                        />
                                    )}
                                </div>

                                <div
                                    style={{
                                        padding: "14px 20px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 12
                                    }}
                                >
                                    {faceError && (
                                        <div
                                            style={{
                                                color: "red",
                                                fontSize: 14,
                                                fontWeight: 600,
                                                textAlign: "center"
                                            }}
                                        >
                                            {faceError}
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            gap: 10,
                                            flexWrap: "wrap"
                                        }}
                                    >
                                        {!capturedImage ? (
                                            <>
                                                <button
                                                    className="lce-btn lce-btn-ghost"
                                                    onClick={handleSwitchCamera}
                                                >
                                                    Đổi camera
                                                </button>

                                                <button
                                                    className="lce-btn lce-btn-primary"
                                                    onClick={handleCapture}
                                                >
                                                    Chụp hình
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="lce-btn lce-btn-ghost"
                                                    onClick={handleRetake}
                                                >
                                                    Chụp lại
                                                </button>

                                                <button
                                                    className="lce-btn lce-btn-secondary"
                                                    onClick={handleVerify}
                                                >
                                                    Xác nhận điểm danh
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    )}

                    {/* ── QR SCANNER MODAL ── */}
                    {isQrOpen && (
                        <div style={{
                            position: "fixed", inset: 0,
                            background: "rgba(0,0,0,0.82)",
                            zIndex: 999,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <div style={{
                                background: "white", borderRadius: 16, overflow: "hidden",
                                width: "min(380px, 94vw)",
                                boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
                            }}>
                                {/* Header */}
                                <div style={{
                                    background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                                    padding: "16px 20px",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                }}>
                                    <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>
                                        Quét QR thẻ sinh viên
                                    </span>
                                    <button onClick={closeQr} style={{
                                        background: "rgba(255,255,255,0.2)", border: "none",
                                        borderRadius: 8, padding: "5px 14px",
                                        color: "white", cursor: "pointer", fontWeight: 600, fontSize: 13,
                                    }}>Đóng</button>
                                </div>

                                <div style={{ padding: 20 }}>
                                    {/* Camera view — LUÔN render để giữ ref, không unmount */}
                                    <div style={{
                                        position: "relative", borderRadius: 12,
                                        overflow: "hidden", background: "#000", marginBottom: 12,
                                    }}>
                                        <video ref={qrVideoRef} autoPlay playsInline muted
                                            style={{ width: "100%", display: "block", maxHeight: 260, objectFit: "cover" }}
                                        />
                                        {/* Overlay canvas — chỉ vẽ khung xanh khi phát hiện QR */}
                                        <canvas
                                            ref={qrCanvasRef}
                                            style={{
                                                position: "absolute", top: 0, left: 0,
                                                width: "100%", height: "100%",
                                                pointerEvents: "none"
                                            }}
                                        />

                                        {/* Toast thành công — góc trên, nhỏ gọn, tự tắt */}
                                        {successPopup && (
                                            <div style={{
                                                position: "fixed", top: 20, left: "50%",
                                                transform: "translateX(-50%)",
                                                zIndex: 9999,
                                                background: "#16a34a",
                                                color: "white",
                                                borderRadius: 10,
                                                boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                                                minWidth: 260, maxWidth: 360,
                                                overflow: "hidden",
                                                animation: "toastIn 0.25s ease",
                                            }}>
                                                <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
                                                {/* Header */}
                                                <div style={{
                                                    display: "flex", alignItems: "center",
                                                    justifyContent: "space-between",
                                                    padding: "10px 14px 8px",
                                                    borderBottom: "1px solid rgba(255,255,255,0.2)",
                                                }}>
                                                    <span style={{ fontWeight: 700, fontSize: 14 }}>Thành công</span>
                                                    <button
                                                        onClick={() => { setSuccessPopup(null); clearTimeout(successTimerRef.current); }}
                                                        style={{
                                                            background: "none", border: "none",
                                                            color: "white", cursor: "pointer",
                                                            fontSize: 16, lineHeight: 1, padding: 0,
                                                        }}>✕</button>
                                                </div>
                                                {/* Body */}
                                                <div style={{ padding: "10px 14px 12px", fontSize: 13 }}>
                                                    Điểm danh thành công
                                                    {successPopup.name && <> — <strong>{successPopup.name}</strong></>}
                                                    {successPopup.mssv && <span style={{ opacity: 0.8 }}> ({successPopup.mssv})</span>}
                                                </div>
                                            </div>
                                        )}

                                        {/* Toast thất bại */}
                                        {errorPopup && (
                                            <div style={{
                                                position: "fixed", top: 20, left: "50%",
                                                transform: "translateX(-50%)",
                                                zIndex: 9999,
                                                background: "#dc2626",
                                                color: "white",
                                                borderRadius: 10,
                                                boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                                                minWidth: 260, maxWidth: 360,
                                                overflow: "hidden",
                                                animation: "toastIn 0.25s ease",
                                            }}>
                                                <div style={{
                                                    display: "flex", alignItems: "center",
                                                    justifyContent: "space-between",
                                                    padding: "10px 14px 8px",
                                                    borderBottom: "1px solid rgba(255,255,255,0.2)",
                                                }}>
                                                    <span style={{ fontWeight: 700, fontSize: 14 }}>Thất bại</span>
                                                    <button
                                                        onClick={() => { setErrorPopup(null); clearTimeout(errorTimerRef.current); }}
                                                        style={{
                                                            background: "none", border: "none",
                                                            color: "white", cursor: "pointer",
                                                            fontSize: 16, lineHeight: 1, padding: 0,
                                                        }}>✕</button>
                                                </div>
                                                <div style={{ padding: "10px 14px 12px", fontSize: 13 }}>
                                                    {errorPopup.msg}
                                                    {errorPopup.mssv && <span style={{ opacity: 0.8 }}> ({errorPopup.mssv})</span>}
                                                </div>
                                            </div>
                                        )}

                                        {/* Khung ngắm — chỉ hiện khi đang scan, không có popup */}
                                        {qrScanning && !successPopup && (
                                            <div style={{
                                                position: "absolute", inset: 0,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                <div style={{ width: 160, height: 160, position: "relative" }}>
                                                    {[
                                                        { top: 0, left: 0, borderTop: "3px solid #3b82f6", borderLeft: "3px solid #3b82f6", borderRadius: "6px 0 0 0" },
                                                        { top: 0, right: 0, borderTop: "3px solid #3b82f6", borderRight: "3px solid #3b82f6", borderRadius: "0 6px 0 0" },
                                                        { bottom: 0, left: 0, borderBottom: "3px solid #3b82f6", borderLeft: "3px solid #3b82f6", borderRadius: "0 0 0 6px" },
                                                        { bottom: 0, right: 0, borderBottom: "3px solid #3b82f6", borderRight: "3px solid #3b82f6", borderRadius: "0 0 6px 0" },
                                                    ].map((s, i) => (
                                                        <div key={i} style={{ position: "absolute", width: 26, height: 26, ...s }} />
                                                    ))}
                                                    <div style={{
                                                        position: "absolute", left: 4, right: 4, height: 2,
                                                        background: "linear-gradient(90deg, transparent, #3b82f6, transparent)",
                                                        animation: "scanLine 1.5s ease-in-out infinite",
                                                    }} />
                                                    <style>{`@keyframes scanLine{0%{top:4px}50%{top:152px}100%{top:4px}}`}</style>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <p style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", margin: 0 }}>
                                        Hướng camera vào mã QR trên thẻ sinh viên
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── TRA CỨU SINH VIÊN ── */}
                    <div className="lce-card" style={{ marginBottom: 20, overflow: "hidden" }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Tra cứu sinh viên</div>
                            <div style={{ fontSize: 13, color: "#64748b" }}>Kiểm tra sinh viên được xếp thi ở phòng nào, ca nào</div>
                        </div>
                        <div style={{ padding: "16px 20px" }}>
                            <form onSubmit={handleLookup} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <input
                                    className="lce-search-input"
                                    value={lookupCode}
                                    onChange={e => { setLookupCode(e.target.value); setLookupResult(null); }}
                                    placeholder="Nhập mã sinh viên..."
                                    style={{
                                        flex: 1, minWidth: 200, border: "1.5px solid #e2e8f0",
                                        borderRadius: 9, padding: "10px 14px", fontSize: 14,
                                        outline: "none", fontFamily: "inherit",
                                    }}
                                />
                                <button type="submit" className="lce-btn lce-btn-primary" disabled={lookupLoading}>
                                    {lookupLoading ? "Đang tìm..." : "Tra cứu"}
                                </button>
                                {lookupResult && (
                                    <button type="button" className="lce-btn lce-btn-ghost"
                                        onClick={() => { setLookupResult(null); setLookupCode(""); }}>
                                        Xoá
                                    </button>
                                )}
                            </form>

                            {lookupResult && (
                                <div style={{ marginTop: 16 }}>
                                    {lookupResult.status === "error" ? (
                                        <div style={{
                                            background: "#fef2f2", border: "1px solid #fecaca",
                                            borderRadius: 10, padding: "14px 18px",
                                            color: "#dc2626", fontSize: 14, fontWeight: 500,
                                        }}>
                                            {lookupResult.msg}
                                        </div>
                                    ) : !lookupResult.hasExam ? (
                                        <div style={{
                                            background: "#f8fafc", border: "1px solid #e2e8f0",
                                            borderRadius: 10, padding: "14px 18px",
                                            color: "#64748b", fontSize: 14,
                                        }}>
                                            Sinh viên <strong>{lookupCode}</strong> không có ca thi nào trong hôm nay.
                                        </div>
                                    ) : (
                                        <div style={{
                                            background: "#f0fdf4", border: "1px solid #bbf7d0",
                                            borderRadius: 10, padding: "16px 20px",
                                        }}>
                                            {/* Cảnh báo đúng/nhầm phòng */}
                                            {lookupResult.data.room !== examData?.room ? (
                                                <div style={{
                                                    background: "#fef9c3", border: "1px solid #fde68a",
                                                    borderRadius: 8, padding: "10px 14px", marginBottom: 14,
                                                    color: "#92400e", fontSize: 13, fontWeight: 600,
                                                }}>
                                                    Sinh viên thi ở phòng <strong>{lookupResult.data.room}</strong> — có thể đi nhầm phòng
                                                </div>
                                            ) : (
                                                <div style={{
                                                    background: "#dcfce7", border: "1px solid #86efac",
                                                    borderRadius: 8, padding: "10px 14px", marginBottom: 14,
                                                    color: "#15803d", fontSize: 13, fontWeight: 600,
                                                }}>
                                                    Đúng phòng thi
                                                </div>
                                            )}

                                            {/* Chi tiết ca thi */}
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
                                                {[
                                                    { label: "Mã SV", value: lookupCode.toUpperCase() },
                                                    { label: "Phòng thi", value: lookupResult.data.room, bold: true },
                                                    { label: "Môn thi", value: lookupResult.data.subject_name || lookupResult.data.subject_code },
                                                    { label: "Mã môn", value: lookupResult.data.subject_code },
                                                    { label: "Giờ thi", value: lookupResult.data.exam_time },
                                                    { label: "Ca thi", value: lookupResult.data.session_code },
                                                ].map((item, i) => (
                                                    <div key={i} style={{ background: "white", borderRadius: 8, padding: "10px 14px" }}>
                                                        <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{item.label}</div>
                                                        <div style={{ fontSize: 14, fontWeight: item.bold ? 700 : 600, color: "#0f172a" }}>{item.value || "—"}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── DANH SÁCH SINH VIÊN ── */}
                    {(() => {
                        const totalPages = Math.ceil(totalCount / PAGE_SIZE);
                        const sortedStudents = sortBy
                            ? [...students].sort((a, b) => {
                                const va = (a[sortBy] || "").toLowerCase();
                                const vb = (b[sortBy] || "").toLowerCase();
                                return sortDir === "asc" ? va.localeCompare(vb, "vi") : vb.localeCompare(va, "vi");
                            })
                            : students;
                        const paginated = sortedStudents; // server đã phân trang sẵn
                        return (
                            <div className="lce-card" style={{ overflow: "hidden" }}>
                                <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                                        Danh sách sinh viên
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
                                    <table className="lce-table">
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                <th>Mã SV</th>
                                                <th onClick={() => handleSort("full_name")} style={{ cursor: "pointer", userSelect: "none", color: sortBy === "full_name" ? "#1e40af" : undefined }}>
                                                    Họ và tên {sortBy === "full_name" ? (sortDir === "asc" ? "▲" : "▼") : <span style={{ opacity: 0.35 }}>▲</span>}
                                                </th>
                                                <th onClick={() => handleSort("class_code")} style={{ cursor: "pointer", userSelect: "none", color: sortBy === "class_code" ? "#1e40af" : undefined }}>
                                                    Lớp {sortBy === "class_code" ? (sortDir === "asc" ? "▲" : "▼") : <span style={{ opacity: 0.35 }}>▲</span>}
                                                </th>
                                                <th>Thời gian</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableLoading ? (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: "center", color: "#94a3b8", padding: "32px 0" }}>
                                                        Đang tải...
                                                    </td>
                                                </tr>
                                            ) : paginated.length > 0 ? (
                                                paginated.map((sv, i) => (
                                                    <tr key={sv.id}>
                                                        <td style={{ color: "#94a3b8", fontWeight: 500 }}>
                                                            {(currentPage - 1) * PAGE_SIZE + i + 1}
                                                        </td>
                                                        <td style={{ fontWeight: 600, fontFamily: "monospace", fontSize: 13 }}>{sv.student_code}</td>
                                                        <td style={{ fontWeight: 500 }}>{sv.full_name}</td>
                                                        <td style={{ color: "#64748b" }}>{sv.class_code}</td>
                                                        <td style={{ color: "#64748b", fontSize: 13 }}>{sv.attendance_time || "—"}</td>
                                                        <td>
                                                            {sv.rekognition_result === "match"
                                                                ? <span className="badge-done">Đã điểm danh</span>
                                                                : <span className="badge-pending">Chưa điểm danh</span>
                                                            }
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: "center", color: "#94a3b8", padding: "32px 0" }}>
                                                        Không có dữ liệu
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination controls */}
                                {totalPages > 1 && (
                                    <div style={{
                                        padding: "14px 20px", borderTop: "1px solid #f1f5f9",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    }}>
                                        <button
                                            className="lce-btn lce-btn-ghost"
                                            style={{ padding: "6px 14px", fontSize: 13 }}
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(1)}
                                        >«</button>
                                        <button
                                            className="lce-btn lce-btn-ghost"
                                            style={{ padding: "6px 14px", fontSize: 13 }}
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => p - 1)}
                                        >‹</button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                            .reduce((acc, p, idx, arr) => {
                                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                                                acc.push(p);
                                                return acc;
                                            }, [])
                                            .map((item, idx) => item === "..." ? (
                                                <span key={`ellipsis-${idx}`} style={{ padding: "6px 4px", color: "#94a3b8", fontSize: 13 }}>...</span>
                                            ) : (
                                                <button
                                                    key={item}
                                                    className="lce-btn"
                                                    style={{
                                                        padding: "6px 12px", fontSize: 13,
                                                        background: item === currentPage ? "#1e40af" : "#f1f5f9",
                                                        color: item === currentPage ? "white" : "#475569",
                                                    }}
                                                    onClick={() => setCurrentPage(item)}
                                                >{item}</button>
                                            ))
                                        }

                                        <button
                                            className="lce-btn lce-btn-ghost"
                                            style={{ padding: "6px 14px", fontSize: 13 }}
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(p => p + 1)}
                                        >›</button>
                                        <button
                                            className="lce-btn lce-btn-ghost"
                                            style={{ padding: "6px 14px", fontSize: 13 }}
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(totalPages)}
                                        >»</button>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </>
            ) : (
                <>
                    <style>{`
                        .lce-empty-card { background: white; border-radius: 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
                        .lce-empty-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
                        .lce-empty-table th { background: #f8fafc; color: #64748b; font-weight: 600; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em; padding: 11px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                        .lce-empty-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
                    `}</style>

                    <div className="lce-empty-card" style={{ overflow: "hidden" }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
                            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                                Danh sách sinh viên điểm danh
                            </h2>
                        </div>
                        <div style={{ overflowX: "auto" }}>
                            <table className="lce-empty-table">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Mã SV</th>
                                        <th>Họ và tên ▲</th>
                                        <th>Lớp ▲</th>
                                        <th>Thời gian điểm danh</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center", padding: "48px 0" }}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <polyline points="12 6 12 12 16 14" />
                                                </svg>
                                                <div style={{ fontSize: 15, fontWeight: 500, color: "#94a3b8" }}>Hiện tại không có ca thi đang diễn ra</div>
                                                <div style={{ fontSize: 13, color: "#cbd5e1" }}>Vui lòng chờ ca thi bắt đầu</div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
            {toast && (
                <div style={{
                    position: "fixed",
                    top: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 9999,
                    background: toast.type === "success" ? "#16a34a" : "#dc2626",
                    color: "white",
                    borderRadius: 10,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                    minWidth: 260,
                    maxWidth: 360,
                    overflow: "hidden",
                    animation: "toastIn 0.25s ease"
                }}>
                    <div style={{
                        padding: "10px 14px",
                        fontWeight: 600,
                        borderBottom: "1px solid rgba(255,255,255,0.2)"
                    }}>
                        {toast.type === "success" ? "Thành công" : "Lỗi"}
                    </div>
                    <div style={{ padding: "10px 14px", fontSize: 13 }}>
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
}