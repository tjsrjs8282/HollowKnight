/** Page sections, in order. Drives the HUD masks, the menu and scroll themes. */
export interface Section {
  id: string;
  label: string;
  labelKo: string;
  /** Particle + accent theme while this section is on screen. */
  theme: "soul" | "void" | "dream" | "silk" | "gold";
}

export const SECTIONS: Section[] = [
  { id: "top", label: "Title", labelKo: "타이틀", theme: "soul" },
  { id: "prologue", label: "Prologue", labelKo: "서막", theme: "void" },
  { id: "journal", label: "Journal", labelKo: "사냥꾼의 일지", theme: "soul" },
  { id: "expansions", label: "Content", labelKo: "무료 확장팩", theme: "dream" },
  { id: "silksong", label: "Silksong", labelKo: "실크송", theme: "silk" },
  { id: "soundtrack", label: "Soundtrack", labelKo: "사운드트랙", theme: "soul" },
  { id: "seer", label: "The Seer", labelKo: "예언자", theme: "dream" },
  { id: "purchase", label: "Purchase", labelKo: "구매", theme: "gold" },
];
