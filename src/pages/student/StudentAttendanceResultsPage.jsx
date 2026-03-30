import EndpointTable from '../../components/EndpointTable'

export default function StudentAttendanceResultsPage() {
    return (
        <EndpointTable
            title="Ket qua diem danh"
            description="Thong tin diem danh trong cac lich thi cua sinh vien."
            endpoint="/student/attendance-results"
            columns={[
                { header: 'Mon hoc', keys: ['subject_name', 'course_name', 'exam_name', 'title'] },
                { header: 'Ngay thi', keys: ['exam_date', 'date', 'start_at'], type: 'date' },
                { header: 'Trang thai', keys: ['attendance_status', 'status'], type: 'status' },
                { header: 'Thoi diem ghi nhan', keys: ['attended_at', 'checked_at', 'updated_at'], type: 'datetime' },
                { header: 'Ghi chu', keys: ['note', 'remark'] },
            ]}
            emptyText="Chua co ban ghi diem danh nao."
        />
    )
}
