import fs from "fs/promises";
import path from "path";

export interface DailyEntry {
  date: string;
  [dev: string]: string | number;
}

export interface ProjectStats {
  daily: DailyEntry[];
  lastUpdated: string;
}

const STATS_PATH = path.join(process.cwd(), "stats.json");

export async function getStats(): Promise<ProjectStats> {
  try {
    const raw = await fs.readFile(STATS_PATH, "utf-8");
    return JSON.parse(raw) as ProjectStats;
  } catch {
    return {
      daily: [],
      lastUpdated: "",
    };
  }
}

export function getDevNames(stats: ProjectStats): string[] {
  if (stats.daily.length === 0) return [];
  const keys = new Set<string>();
  for (const entry of stats.daily) {
    for (const key of Object.keys(entry)) {
      if (key !== "date") keys.add(key);
    }
  }
  return Array.from(keys);
}
