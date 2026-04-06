import React from "react";
import { useAuth } from "../../auth/AuthContext"; // Đảm bảo đúng đường dẫn tới file AuthContext

export default function LecturerProfilePage() {
    // Lấy thông tin user từ Context
    const { user } = useAuth();

    return (
        <div style={{ padding: "20px" }}>
            <h2>Thông tin cá nhân</h2>
            <p>Xem chi tiết thông tin tài khoản của bạn.</p>

            <div style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "20px",
                backgroundColor: "#f9f9f9",
            }}>
                {/* Sử dụng optional chaining (?.) để tránh lỗi nếu user chưa load kịp */}
                <p><strong>Tên:</strong> {user?.name || user?.full_name || "N/A"}</p>
                <p><strong>Email:</strong> {user?.email || "N/A"}</p>
                <p><strong>Mã giảng viên:</strong> {user?.code || user?.id || "N/A"}</p>
                <p><strong>Vai trò:</strong> {user?.role === 'lecturer' ? 'Giảng viên' : user?.role}</p>
            </div>

            <h3>Đổi mật khẩu</h3>
            <p>Thay đổi mật khẩu tài khoản của bạn.</p>

            <form style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "20px",
                backgroundColor: "#f9f9f9",
            }}>
                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="currentPassword">Mật khẩu hiện tại:</label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="newPassword">Mật khẩu mới:</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu mới:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        style={{ width: "100%", padding: "8px", marginTop: "5px", borderRadius: "4px", border: "1px solid #ddd" }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Đổi mật khẩu
                </button>
            </form>
        </div>
    );
}