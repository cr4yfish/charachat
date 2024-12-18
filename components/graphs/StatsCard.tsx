"use client"

import { CartesianGrid, XAxis, BarChart, Bar, LabelList } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"
import { Stats } from "@/types/db"
import { useEffect, useState } from "react"

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const chartConfig = {
  message_count: {
    label: "Messages",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

type Props = {
  stats: Stats[];
  title: string;
  description: string;
  interval?: "monthly" | "weekly" | "daily";
}

export function StatsCard(props: Props) {
  const [data, setData] = useState<Stats[]>([])

  useEffect(() => {
    setData(props.stats.reverse().map((item) => ({
      timeframe: props.interval == "daily" ? new Date(item.timeframe).toLocaleDateString() : months[new Date(item.timeframe).getMonth()],
      count: item.count,
      accumulated_count: item?.accumulated_count,
    })))
  }, [props.stats])

  return (
    <Card className="w-[300px] max-sm:max-w-full bg-white/40 dark:bg-zinc-900/20 ">
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <CardDescription>
          {props.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="text-zinc-400">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 20
            }}
          >
            <CartesianGrid vertical={false} stroke="transparent" />
            <XAxis
              dataKey="timeframe"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <Bar
              dataKey={props.stats[0]?.accumulated_count ? "accumulated_count" : "count"}
              fill="var(--charts-1)"
              radius={[8, 8, 0, 0]}

            >
              <LabelList 
                position={"top"}
                offset={12}
                fontSize={12}
                formatter={(value: number) => `${value.toLocaleString()}`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
