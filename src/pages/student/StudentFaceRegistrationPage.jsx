import PostActionPanel from '../../components/PostActionPanel'
import EndpointTable from '../../components/EndpointTable'

export default function StudentFaceRegistrationPage() {
    return (
        <div className="stacked-grid">
            <EndpointTable
                title="Khung thoi gian dang ky khuon mat"
                description="Kiem tra sinh vien co the dang ky anh khuon mat trong thoi diem hien tai hay khong."
                endpoint="/student/face-registration/window"
                columns={[
                    { header: 'Mo dang ky', keys: ['is_open', 'is_available', 'open'], type: 'status' },
                    { header: 'Bat dau', keys: ['start_at', 'start_time'], type: 'datetime' },
                    { header: 'Ket thuc', keys: ['end_at', 'end_time'], type: 'datetime' },
                    { header: 'Trang thai', keys: ['status', 'message'], type: 'status' },
                ]}
                emptyText="Khong co thong tin khung dang ky."
            />
            <PostActionPanel
                title="Upload URL"
                description="Tao signed URL de upload anh khuon mat len storage."
                endpoint="/student/face-registration/generate-upload-url"
                payloadHint={`{
  "file_name": "student-face.jpg",
  "content_type": "image/jpeg"
}`}
            />
            <PostActionPanel
                title="Xac nhan upload"
                description="Sau khi upload xong can goi endpoint confirm-upload."
                endpoint="/student/face-registration/confirm-upload"
                payloadHint={`{
  "file_key": "faces/student-face.jpg"
}`}
            />
        </div>
    )
}
