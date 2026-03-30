import EndpointTable from '../../components/EndpointTable'
import StudentLookupPanel from '../../components/StudentLookupPanel'

export default function LecturerCurrentExamPage() {
    return (
        <div className="stacked-grid">
            <EndpointTable
                title="Ca thi hien tai"
                description="Thong tin ca thi dang dien ra o thoi diem hien tai."
                endpoint="/lecturer/exam-schedules/current"
                columns={[
                    { header: 'Mon hoc', keys: ['subject_name', 'course_name', 'exam_name', 'title'] },
                    { header: 'Bat dau', keys: ['start_time', 'start_at'], type: 'datetime' },
                    { header: 'Ket thuc', keys: ['end_time', 'end_at'], type: 'datetime' },
                    { header: 'Phong', keys: ['room', 'room_name', 'location'] },
                    { header: 'So SV', keys: ['student_count', 'students_count'] },
                    { header: 'Trang thai', keys: ['status'], type: 'status' },
                ]}
                emptyText="Hien tai khong co ca thi dang dien ra."
            />
            <StudentLookupPanel />
        </div>
    )
}
