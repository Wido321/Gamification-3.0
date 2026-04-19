import { getMyProfileAction } from '@/app/actions/gamification'
import { StudentView } from '@/components/dashboard/StudentView'
import { TeacherView } from '@/components/dashboard/TeacherView'
import { DevView } from '@/components/dashboard/DevView'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const result = await getMyProfileAction()

  if (!result.success || !result.data) {
    redirect('/auth/login')
  }

  const profile = result.data as any

  return (
    <div className="w-full">
      {profile.role === 'student' && <StudentView profile={profile} />}
      {profile.role === 'teacher' && <TeacherView profile={profile} />}
      {profile.role === 'dev' && <DevView profile={profile} />}
    </div>
  )
}

