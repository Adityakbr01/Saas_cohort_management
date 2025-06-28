import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserData {
  name: string
  email: string
  profileImageUrl: string
  stats: {
    coursesCompleted: number
    certificatesEarned: number
    totalHoursLearned: number
  }
}

export function ProfileSidebar({ userData }: { userData: UserData }) {

  console.log(userData)
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={userData.profileImageUrl} alt={userData.name} className="object-cover"/>
            <AvatarFallback className="text-lg">
              {userData.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold mb-1">{userData.name}</h2>
          <p className="text-muted-foreground text-sm">{userData.email}</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{userData.stats.coursesCompleted}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{userData.stats.certificatesEarned}</div>
              <div className="text-xs text-muted-foreground">Certificates</div>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <div className="text-lg font-semibold">{userData.stats.totalHoursLearned} hours</div>
            <div className="text-sm text-muted-foreground">Total Learning Time</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}