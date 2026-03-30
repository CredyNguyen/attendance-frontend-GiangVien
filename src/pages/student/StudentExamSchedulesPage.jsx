import EndpointTable from '../../components/EndpointTable'

export default function StudentExamSchedulesPage() {
    return (
        <EndpointTable
            title="Lich thi cua ban"
            description="Danh sach lich thi duoc cap cho sinh vien hien tai."
            endpoint="/student/exam-schedules"
            columns={[
                { header: 'Mon hoc', keys: ['subject_name', 'course_name', 'exam_name', 'title'] },
                { header: 'Ngay thi', keys: ['exam_date', 'date', 'start_at'], type: 'date' },
                { header: 'Bat dau', keys: ['start_time', 'start_at'], type: 'datetime' },
                { header: 'Ket thuc', keys: ['end_time', 'end_at'], type: 'datetime' },
                { header: 'Phong', keys: ['room', 'room_name', 'location'] },
                { header: 'Trang thai', keys: ['status'], type: 'status' },
            ]}
            emptyText="Ban chua co lich thi nao."
        />
    )
}
