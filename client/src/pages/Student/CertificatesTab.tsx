import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award } from "lucide-react"
import { Link } from "react-router-dom"
import { TabsContent } from "@/components/ui/tabs"

interface UserData {
  certificates: {
    id: string
    title: string
    instructor: string
    issueDate: string
  }[]
}

export function CertificatesTab({ userData }: { userData: UserData }) {
  return (
    <TabsContent value="certificates" className="mt-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">My Certificates</h3>
          {userData.certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userData.certificates.map((cert) => (
                <Card key={cert.id} className="border-2 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">{cert.title}</h4>
                    <p className="text-sm text-muted-foreground mb-1">Instructor: {cert.instructor}</p>
                    <p className="text-sm text-muted-foreground mb-4">Issued: {cert.issueDate}</p>
                    <Button size="sm" variant="outline">
                      Download Certificate
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold mb-2">No Certificates Yet</h4>
                <p className="text-muted-foreground mb-4">
                  Complete courses to earn certificates and showcase your achievements.
                </p>
                <Button asChild>
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </TabsContent>
  )
}