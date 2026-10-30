import type { ImageMetadata } from "astro";

import steam from "../assets/stores/steam.png";
import gog from "../assets/stores/gog.png";
import nintendo from "../assets/stores/switch.png";
import playstation from "../assets/stores/playstation.png";
import xbox from "../assets/stores/xbox.png";
import humble from "../assets/stores/humble.png";
import fangamer from "../assets/stores/fangamer.png";
import yetee from "../assets/stores/yetee.png";

export interface Store {
  name: string;
  logo: ImageMetadata;
  href: string;
  /** Brand colour revealed on hover. */
  tint: string;
}

/** Every URL below was checked live (HTTP 200 + matching page title). */
export const STORES: Record<"hollowKnight" | "silksong", Store[]> = {
  hollowKnight: [
    { name: "Steam", logo: steam, href: "https://store.steampowered.com/app/367520/Hollow_Knight/", tint: "#66c0f4" },
    { name: "Nintendo Switch", logo: nintendo, href: "https://www.nintendo.com/us/store/products/hollow-knight-switch/", tint: "#e60012" },
    { name: "PlayStation", logo: playstation, href: "https://store.playstation.com/en-us/product/UP1822-CUSA13632_00-HOLLOWKNIGHT18US", tint: "#2e6cf6" },
    { name: "Xbox", logo: xbox, href: "https://www.xbox.com/en-US/games/store/hollow-knight-voidheart-edition/9MW9469V91LM", tint: "#107c10" },
    { name: "GOG", logo: gog, href: "https://www.gog.com/en/game/hollow_knight", tint: "#b06ae0" },
    { name: "Humble Store", logo: humble, href: "https://www.humblebundle.com/store/hollow-knight", tint: "#cc2929" },
  ],
  silksong: [
    { name: "Steam", logo: steam, href: "https://store.steampowered.com/app/1030300/Hollow_Knight_Silksong/", tint: "#66c0f4" },
    { name: "Nintendo Switch", logo: nintendo, href: "https://www.nintendo.com/us/store/products/hollow-knight-silksong-switch/", tint: "#e60012" },
    { name: "PlayStation", logo: playstation, href: "https://www.playstation.com/en-us/games/hollow-knight-silksong/", tint: "#2e6cf6" },
    { name: "Xbox", logo: xbox, href: "https://www.xbox.com/en-US/games/store/hollow-knight-silksong/9N116V0599HB", tint: "#107c10" },
    { name: "GOG", logo: gog, href: "https://www.gog.com/en/game/hollow_knight_silksong", tint: "#b06ae0" },
  ],
};

export const MERCH: Store[] = [
  { name: "Fangamer", logo: fangamer, href: "https://www.fangamer.com/collections/hollow-knight", tint: "#a6d608" },
  { name: "The Yetee", logo: yetee, href: "https://theyetee.com/collections/hollow-knight", tint: "#3fb6f2" },
];

export const SOCIAL = [
  { name: "Team Cherry", href: "https://www.teamcherry.com.au/" },
  { name: "X / Twitter", href: "https://twitter.com/TeamCherryGames" },
  { name: "YouTube", href: "https://www.youtube.com/user/teamcherrygames" },
  { name: "Silksong 공식 사이트", href: "https://hollowknightsilksong.com/" },
] as const;
