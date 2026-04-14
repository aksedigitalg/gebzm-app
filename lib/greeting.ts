import { Sunrise, Sun, Sunset, Moon, type LucideIcon } from "lucide-react";

export interface Greeting {
  text: string;
  icon: LucideIcon;
}

export function getGreeting(date: Date = new Date()): Greeting {
  const h = date.getHours();
  if (h >= 5 && h < 12) return { text: "Günaydın", icon: Sunrise };
  if (h >= 12 && h < 18) return { text: "İyi Günler", icon: Sun };
  if (h >= 18 && h < 22) return { text: "İyi Akşamlar", icon: Sunset };
  return { text: "İyi Geceler", icon: Moon };
}
