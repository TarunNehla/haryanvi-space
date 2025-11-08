import { TrendingUp, Music } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type TabType = "popular" | "recent";

interface SongTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function SongTabs({ activeTab, onTabChange }: SongTabsProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TabType)}>
        <TabsList className="bg-muted/60 p-1 h-11">
          <TabsTrigger
            value="popular"
            className={cn(
              "data-[state=active]:!bg-background data-[state=active]:!text-foreground",
              "data-[state=active]:border-2 data-[state=active]:border-primary/20",
              "data-[state=active]:shadow-lg data-[state=active]:font-bold",
              "transition-all duration-200"
            )}
          >
            <TrendingUp />
            Popular Songs
          </TabsTrigger>
          <TabsTrigger
            value="recent"
            className={cn(
              "data-[state=active]:!bg-background data-[state=active]:!text-foreground",
              "data-[state=active]:border-2 data-[state=active]:border-primary/20",
              "data-[state=active]:shadow-lg data-[state=active]:font-bold",
              "transition-all duration-200"
            )}
          >
            <Music />
            Recent Releases
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
