import EndpointTable from '../../components/EndpointTable'

export default function LecturerTodayExamsPage() {
    return (
        <EndpointTable
            title="Lich thi hom nay"
            description="Danh sach ca thi hom nay cua giang vien."
            endpoint="/lecturer/exam-schedules/today"
            columns={[
                { header: 'Mon hoc', keys: ['subject_name', 'course_name', 'exam_name', 'title'] },
                { header: 'Bat dau', keys: ['start_time', 'start_at'], type: 'datetime' },
                { header: 'Ket thuc', keys: ['end_time', 'end_at'], type: 'datetime' },
                { header: 'Phong', keys: ['room', 'room_name', 'location'] },
                { header: 'So SV', keys: ['student_count', 'students_count'] },
                { header: 'Trang thai', keys: ['status'], type: 'status' },
            ]}
            emptyText="Hom nay ban khong co ca thi nao."
        />
    )
}
