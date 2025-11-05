import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "../components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <StatCard
        title="Consents Granted"
        value="1,240"
        change="+12.5%"
        changeType="up"
        description="Compared to last month"
        icon={TrendingUp}
      />

      <StatCard
        title="Revoked Consents"
        value="180"
        change="-5.2%"
        changeType="down"
        description="Compared to last month"
      />
      <StatCard
        title="Offers Accepted"
        value="0"
        change=""
        changeType="down"
        description="All time"
      />
      <StatCard
        title="Cashback Balance"
        value="₦1.24"
        change="1.1%"
        changeType="up"
        description="Across 11 revoked consents"
      />
    </div>
  );
}

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ElementType;
  change?: string; // e.g. "+12.5%"
  changeType?: "up" | "down";
  description?: string; // e.g. "Visitors for the last 6 months"
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType,
  description,
}: StatCardProps) {
  const ChangeIcon =
    changeType === "up"
      ? TrendingUp
      : changeType === "down"
        ? TrendingDown
        : null;

  const badgeColor =
    changeType === "up"
      ? "bg-green-100 text-green-800"
      : changeType === "down"
        ? "bg-red-100 text-red-800"
        : "";

  return (
    <Card className="@container/card transition-all shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardDescription>{title}</CardDescription>
          </div>
          {change && ChangeIcon && (
            <Badge variant="outline" className={`gap-1 ${badgeColor}`}>
              <ChangeIcon className="w-4 h-4" />
              {change}
            </Badge>
          )}
        </div>

        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-gray-500" />}
          {value}
        </CardTitle>
      </CardHeader>

      {description && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm text-muted-foreground">
          <div className="line-clamp-1 flex gap-2 font-medium text-gray-800">
            {changeType === "up" && (
              <>
                Trending up this month{" "}
                <TrendingUp className="w-4 h-4 text-green-600" />
              </>
            )}
            {changeType === "down" && (
              <>
                Trending down this month{" "}
                <TrendingDown className="w-4 h-4 text-red-600" />
              </>
            )}
          </div>
          <div>{description}</div>
        </CardFooter>
      )}
    </Card>
  );
}
