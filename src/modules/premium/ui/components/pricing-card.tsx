"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  title: string;
  description: string;
  price: string | number;
  interval?: string;
  savings?: string;
  features: readonly string[];
  isPopular?: boolean;
  highlighted?: boolean;
  isEnterprise?: boolean;
  onSelect: () => void;
  isLoading?: boolean;
  currentPlan?: boolean;
}

export function PricingCard({
  title,
  description,
  price,
  interval,
  savings,
  features,
  isPopular = false,
  highlighted = false,
  isEnterprise = false,
  onSelect,
  isLoading = false,
  currentPlan = false,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col transition-all duration-300 hover:shadow-xl",
        isPopular && "border-2 border-primary shadow-2xl shadow-primary/30 scale-105 bg-gradient-to-br from-primary/5 via-transparent to-primary/5",
        !isPopular && "hover:scale-105",
        currentPlan && "border-2 border-green-500"
      )}
    >
      {isPopular && (
        <>
          {/* Animated gradient border effect */}
          <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-blue-500 to-primary rounded-lg opacity-75 blur-sm -z-10 animate-pulse" />
          
          {/* Most Popular Badge */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500 rounded-full blur-md opacity-75 animate-pulse" />
              <Badge className="relative bg-gradient-to-r from-primary to-blue-500 px-6 py-1.5 text-sm font-bold shadow-lg">
                ⭐ MOST POPULAR
              </Badge>
            </div>
          </div>
        </>
      )}

      {currentPlan && !isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-green-500 px-4 py-1 text-sm font-semibold">Current Plan</Badge>
        </div>
      )}

      <CardHeader className="pb-8 pt-6">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-8">
          {isEnterprise ? (
            <div className="text-4xl font-bold">{price}</div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">${price}</span>
              {interval && <span className="text-muted-foreground">/{interval}</span>}
            </div>
          )}
          {savings && (
            <Badge variant="outline" className="mt-2 border-green-500 text-green-600">
              {savings}
            </Badge>
          )}
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          className="w-full"
          size="lg"
          onClick={onSelect}
          disabled={isLoading || currentPlan}
          variant={isPopular ? "default" : "outline"}
        >
          {isLoading ? "Loading..." : currentPlan ? "Current Plan" : isEnterprise ? "Contact Sales" : "Upgrade Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}
