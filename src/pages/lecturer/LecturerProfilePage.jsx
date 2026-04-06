import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import api from "../../utils/api"; 

export default function LecturerProfilePage() {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [status, setStatus] = useState({ type: "", message: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: "", message: "" });

        if (formData.newPassword !== formData.confirmPassword) {
            setStatus({ type: "error", message: "Mật khẩu xác nhận không khớp!" });
            return;
        }

        setLoading(true);
        try {
            // SỬA TẠI ĐÂY: Dùng .patch và sửa tên field theo ảnh Postman
            const response = await api.patch("/auth/change-password", {
                current_password: formData.currentPassword,
                password: formData.newPassword,               // Backend dùng 'password'
                password_confirmation: formData.confirmPassword // Backend dùng 'password_confirmation'
            });

            // Backend trả về success: true trong ảnh
            if (response.data.success) {
                setStatus({ type: "success", message: response.data.message || "Đổi mật khẩu thành công!" });
                setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            }
        } catch (error) {
            // Lấy message lỗi từ backend nếu có (ví dụ: mật khẩu cũ sai)
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
            setStatus({ type: "error", message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Thông tin cá nhân</h2>
            <div style={{
                border: "1px solid #ccc", borderRadius: "8px", padding: "20px",
                marginBottom: "20px", backgroundColor: "#f9f9f9",
            }}>
                <p><strong>Tên:</strong> {user?.name || user?.full_name || "N/A"}</p>
                <p><strong>Email:</strong> {user?.email || "N/A"}</p>
                <p><strong>Mã giảng viên:</strong> {user?.code || user?.id || "N/A"}</p>
                <p><strong>Vai trò:</strong> Giảng viên</p>
            </div>

            <h3>Đổi mật khẩu</h3>

            {status.message && (
                <div style={{
                    padding: "10px", marginBottom: "15px", borderRadius: "4px",
                    backgroundColor: status.type === "success" ? "#d4edda" : "#f8d7da",
                    color: status.type === "success" ? "#155724" : "#721c24",
                    border: `1px solid ${status.type === "success" ? "#c3e6cb" : "#f5c6cb"}`
                }}>
                    {status.message}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{
                border: "1px solid #ccc", borderRadius: "8px", padding: "20px", backgroundColor: "#f9f9f9",
            }}>
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="currentPassword">Mật khẩu hiện tại:</label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="newPassword">Mật khẩu mới:</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu mới:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: loading ? "#6c757d" : "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                </button>
            </form>
        </div>
    );
}