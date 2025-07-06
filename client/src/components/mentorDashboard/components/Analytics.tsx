import {
  BarChart3,
  Clock,
  Award,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// ✅ Type for a single item
type PerformanceItem = {
  month: string;
  engagement: number;
  completion: number;
  satisfaction: number;
};


// ✅ Props interface
interface AnalyticsProps {
  performanceData: PerformanceItem[];
}

// ✅ Summary stats for cards
const summaryStats = [
  {
    title: "Student Engagement",
    value: "91%",
    sub: "+5% from last month",
    icon: <BarChart3 className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: "Average Response Time",
    value: "1.5h",
    sub: "Faster than average",
    icon: <Clock className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: "Student Satisfaction",
    value: "4.9/5",
    sub: "Excellent rating",
    icon: <Award className="h-4 w-4 text-muted-foreground" />,
  },
];

function Analytics({ performanceData }: AnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
          <CardDescription>
            Comprehensive view of your mentoring performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              engagement: {
                label: "Engagement",
                color: "#f54900", // HEX or named color
              },
              completion: {
                label: "Completion",
                color: "#009689",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="engagement" fill="#f54900" />
                <Bar dataKey="completion" fill="#009689" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default Analytics;
