import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatusStats {
  pending: number;
  approved: number;
  rejected: number;
  revision_requested: number;
}

interface CategoryPieChartProps {
  data: StatusStats;
}

const COLORS = {
  pending: 'hsl(45, 93%, 47%)',
  approved: 'hsl(152, 69%, 50%)',
  rejected: 'hsl(0, 84%, 60%)',
  revision_requested: 'hsl(217, 91%, 60%)',
};

const LABELS = {
  pending: 'Beklemede',
  approved: 'Onaylanan',
  rejected: 'Reddedilen',
  revision_requested: 'Revizyon',
};

const chartConfig = {
  pending: { label: 'Beklemede', color: COLORS.pending },
  approved: { label: 'Onaylanan', color: COLORS.approved },
  rejected: { label: 'Reddedilen', color: COLORS.rejected },
  revision_requested: { label: 'Revizyon', color: COLORS.revision_requested },
};

export const CategoryPieChart = ({ data }: CategoryPieChartProps) => {
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key,
      value,
      label: LABELS[key as keyof typeof LABELS],
      fill: COLORS[key as keyof typeof COLORS],
    }));

  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            Başvuru Durumları
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground">Henüz başvuru bulunmuyor</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Başvuru Durumları
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="label"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
            <ChartLegend content={<ChartLegendContent nameKey="label" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
