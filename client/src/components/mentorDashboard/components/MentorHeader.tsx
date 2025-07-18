import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";
import { MessageSquare, Bell, Settings } from "lucide-react";

interface MentorHeaderProps {
  mentorData: User ;
  onMessagesClick: () => void;
}

function MentorHeader({ mentorData, onMessagesClick }: MentorHeaderProps) {
  
  console.log(mentorData)

  const nameParts = mentorData?.name?.trim().split(" ");
  const displayName = nameParts.length > 1 ? nameParts[1] : nameParts[0];
  const initials =
    nameParts.length > 1
      ? nameParts[0][0] + nameParts[1][0]
      : nameParts[0]?.substring(0, 2).toUpperCase() || "M";

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={mentorData.profileImageUrl || "/placeholder.svg"}
            alt={mentorData.name || "Mentor"}
          />
          <AvatarFallback className="text-lg font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {displayName}!</h1>
          <p className="text-muted-foreground">{mentorData.specialization} Mentor</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onMessagesClick}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Messages
        </Button>
        <Button variant="outline">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </Button>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}

export default MentorHeader;
