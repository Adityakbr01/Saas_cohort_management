import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

// 👇 Dummy data type
type DashboardStats = {
  totalStudents: number;
  activeStudents: number;
  atRiskStudents: number;
  activeCohorts: number;
  averageProgress: number;
  completionRate: number;
  monthlyGrowth: number;
};

interface QuickStatsProps {
  stats: DashboardStats;
}

// ✅ Icon styling wrapper
const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="h-5 w-5 text-muted-foreground">{children}</div>
);

function QuickStats({ stats }: QuickStatsProps) {
  const cards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      description: `${stats.activeStudents} active, ${stats.atRiskStudents} at risk`,
      icon: <Users />,
    },
    {
      title: "Active Cohorts",
      value: stats.activeCohorts,
      description: `+${stats.monthlyGrowth}% this month`,
      icon: <BookOpen />,
    },
    {
      title: "Average Progress",
      value: `${stats.averageProgress}%`,
      description: (
        <Progress
          value={stats.averageProgress}
          className="mt-2 w-full"
        />
      ),
      icon: <TrendingUp />,
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      description: "Above average",
      icon: <Award />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, idx) => (
        <Card key={idx}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <IconWrapper>{card.icon}</IconWrapper>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {typeof card.description === "string" ? (
              <p className="text-xs text-muted-foreground">{card.description}</p>
            ) : (
              card.description
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default QuickStats;
