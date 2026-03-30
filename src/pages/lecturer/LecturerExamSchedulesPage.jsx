import EndpointTable from '../../components/EndpointTable'

export default function LecturerExamSchedulesPage() {
    return (
        <EndpointTable
            title="Lich thi duoc phan cong"
            description="Tong hop cac lich thi ma giang vien dang phu trach."
            endpoint="/lecturer/exam-schedules"
            columns={[
                { header: 'Mon hoc', keys: ['subject_name', 'course_name', 'exam_name', 'title'] },
                { header: 'Lop', keys: ['class_name', 'class_code', 'group_name'] },
                { header: 'Ngay thi', keys: ['exam_date', 'date', 'start_at'], type: 'date' },
                { header: 'Ca thi', keys: ['session_name', 'session', 'time_slot'] },
                { header: 'Phong', keys: ['room', 'room_name', 'location'] },
                { header: 'Trang thai', keys: ['status'], type: 'status' },
            ]}
            emptyText="Ban chua duoc phan cong lich thi nao."
        />
    )
}
