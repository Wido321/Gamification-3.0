import { getMyProfileAction } from '@/app/actions/gamification'
import { StudentView } from '@/components/dashboard/StudentView'
import { TeacherView } from '@/components/dashboard/TeacherView'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { success, data: profile } = await getMyProfileAction()

  if (!success || !profile) {
    redirect('/auth/login')
  }

  return (
    <div className="w-full">
      {profile.role === 'student' && <StudentView profile={profile} />}
      {(profile.role === 'teacher' || profile.role === 'dev') && <TeacherView profile={profile} />}
    </div>
  )
}
