"use client"

import { GlobalAlert } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Zap, Cloud, Globe, BarChart3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const originIcons = {
  'Geopolítica': Globe,
  'Natureza': Cloud,
  'Tech': Zap,
  'Mercado': BarChart3,
};

interface AIAlertsProps {
  alerts: GlobalAlert[];
}

export function AIAlerts({ alerts }: AIAlertsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-headline font-bold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-accent" />
          Nexus Sentinel Alerts
        </h2>
        <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
          LIVE FEED
        </Badge>
      </div>

      <div className="grid gap-4">
        {alerts.map((alert) => {
          const Icon = originIcons[alert.origin];
          return (
            <Card key={alert.id} className="glass-panel border-white/5 hover:border-accent/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 rounded-full bg-accent/10 text-accent">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-headline uppercase tracking-widest text-accent">
                        {alert.origin}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(alert.timestamp)} ago
                      </span>
                    </div>
                    <h4 className="font-bold text-lg mb-2">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {alert.causality}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent" 
                          style={{ width: `${(alert.priority / 5) * 100}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-headline text-muted-foreground">PRIORITY {alert.priority}/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}