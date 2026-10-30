import type { ImageMetadata } from "astro";
import { withBase } from "../lib/paths";

import hiddenDreams from "../assets/dlc/hidden-dreams.jpg";
import grimmTroupe from "../assets/dlc/grimm-troupe.jpg";
import lifeblood from "../assets/dlc/lifeblood.jpg";
import godmaster from "../assets/dlc/godmaster.jpg";

import ostHollow from "../assets/ost/hollow-knight.png";
import ostHornet from "../assets/ost/hornet.png";
import ostGods from "../assets/ost/gods-nightmares.png";

/** Official Team Cherry uploads only (checked against YouTube oEmbed). */
export const TRAILERS = {
  hollowKnight: { id: "U8lbFP8i730", title: "Hollow Knight — Beneath and Beyond Trailer" },
  silksongRelease: { id: "6XGeJwsUP9c", title: "Hollow Knight: Silksong — Release Trailer" },
  seaOfSorrow: { id: "qDFEeeLy6ws", title: "Hollow Knight: Silksong — Sea of Sorrow Teaser" },
} as const;

export interface Expansion {
  id: string;
  name: string;
  nameKo: string;
  date: string;
  accent: string;
  poster: ImageMetadata;
  summary: string;
  trailer?: { id: string; title: string };
}

export const EXPANSIONS: Expansion[] = [
  {
    id: "hidden-dreams",
    name: "Hidden Dreams",
    nameKo: "숨겨진 꿈",
    date: "2017.08",
    accent: "#d9a6ff",
    poster: hiddenDreams,
    summary:
      "쇠똥구리 수호기사와 조트의 꿈속 버전, 두 드림 보스와 전용 사운드트랙. 새로운 사슴벌레 정거장과 몽환의 대못으로 여는 순간이동 기술 '꿈의 관문'까지.",
    trailer: { id: "7Q-HWedUolo", title: "Hollow Knight: Hidden Dreams" },
  },
  {
    id: "grimm-troupe",
    name: "The Grimm Troupe",
    nameKo: "그림 극단",
    date: "2017.10",
    accent: "#ff4d5e",
    poster: grimmTroupe,
    summary:
      "기묘한 극단이 신성둥지에 천막을 칩니다. 새로운 보스와 퀘스트, 부적 4종과 부서지지 않는 '불멸' 부적, 백색 궁전 재입장, 그리고 악명 높은 '고통의 길'.",
    trailer: { id: "b1imD1_uu0w", title: "Hollow Knight: The Grimm Troupe" },
  },
  {
    id: "lifeblood",
    name: "Lifeblood",
    nameKo: "생명혈",
    date: "2018.04",
    accent: "#58c8ff",
    poster: lifeblood,
    summary:
      "새로운 보스 '벌집 기사'와 직접 찍는 맵 마커, 그리고 게임 전반의 그래픽·사운드·밸런스를 다듬은 대규모 개선 업데이트.",
  },
  {
    id: "godmaster",
    name: "Godmaster",
    nameKo: "신을 찾는 이",
    date: "2018.08",
    accent: "#e3c88f",
    poster: godmaster,
    summary:
      "마지막이자 가장 거대한 확장. 신들의 고향과 보스 러시 '판테온', 더 강해진 보스들과의 재대결, 그리고 새로운 엔딩까지.",
    trailer: { id: "UBxtfDAtVTY", title: "Hollow Knight: Godmaster" },
  },
];

export interface Track {
  id: string;
  title: string;
  album: string;
  src: string;
  cover: ImageMetadata;
  duration: string;
  accent: string;
}

export const TRACKS: Track[] = [
  {
    id: "enter-hallownest",
    title: "Enter Hallownest",
    album: "Hollow Knight OST",
    src: withBase("audio/ost/enter-hallownest.mp3"),
    cover: ostHollow,
    duration: "1:29",
    accent: "#a8d4ff",
  },
  {
    id: "hornet",
    title: "Hornet",
    album: "Hollow Knight OST",
    src: withBase("audio/ost/hornet.mp3"),
    cover: ostHornet,
    duration: "2:46",
    accent: "#e0334a",
  },
  {
    id: "the-grimm-troupe",
    title: "The Grimm Troupe",
    album: "Hollow Knight: Gods & Nightmares",
    src: withBase("audio/ost/the-grimm-troupe.mp3"),
    cover: ostGods,
    duration: "2:18",
    accent: "#ff4d5e",
  },
];

export const STATS = [
  { value: 130, suffix: "+", label: "적", en: "Enemies" },
  { value: 30, suffix: "", label: "보스", en: "Epic bosses" },
  { value: 4, suffix: "", label: "무료 확장팩", en: "Free content packs" },
  { value: 2017, suffix: "", label: "출시", en: "Released" },
] as const;

export const SEER_SUGGESTIONS = [
  "역병은 어디에서 시작됐나요?",
  "창백한 왕은 어떤 존재인가요?",
  "실크송은 어떤 이야기인가요?",
] as const;
