import type { ImageMetadata } from "astro";

import knight from "../assets/characters/knight.png";
import hornet from "../assets/characters/hornet.png";
import quirrel from "../assets/characters/quirrel.png";
import zote from "../assets/characters/zote.png";
import mantisLords from "../assets/characters/mantis-lords.png";
import falseKnight from "../assets/characters/false-knight.png";
import dungDefender from "../assets/characters/dung-defender.png";
import soulMaster from "../assets/characters/soul-master.png";
import brokenVessel from "../assets/characters/broken-vessel.png";

import knight1 from "../assets/scenes/knight-1.jpg";
import knight2 from "../assets/scenes/knight-2.jpg";
import hornet1 from "../assets/scenes/hornet-1.jpg";
import hornet2 from "../assets/scenes/hornet-2.jpg";
import quirrel1 from "../assets/scenes/quirrel-1.jpg";
import quirrel2 from "../assets/scenes/quirrel-2.jpg";
import zote1 from "../assets/scenes/zote-1.jpg";
import zote2 from "../assets/scenes/zote-2.jpg";
import mantis1 from "../assets/scenes/mantis-lords-1.jpg";
import mantis2 from "../assets/scenes/mantis-lords-2.jpg";
import false1 from "../assets/scenes/false-knight-1.jpg";
import false2 from "../assets/scenes/false-knight-2.jpg";
import dung1 from "../assets/scenes/dung-defender-1.jpg";
import dung2 from "../assets/scenes/dung-defender-2.jpg";
import soul1 from "../assets/scenes/soul-master-1.jpg";
import soul2 from "../assets/scenes/soul-master-2.jpg";
import broken1 from "../assets/scenes/broken-vessel-1.jpg";
import broken2 from "../assets/scenes/broken-vessel-2.jpg";

export interface Character {
  id: string;
  name: string;
  /** Korean name, or a descriptive title where no official one is certain. */
  nameKo: string;
  role: string;
  kind: "hero" | "npc" | "boss";
  accent: string;
  art: ImageMetadata;
  scenes: [ImageMetadata, ImageMetadata];
  description: string;
  quote?: string;
}

export const CHARACTERS: Character[] = [
  {
    id: "knight",
    name: "The Knight",
    nameKo: "기사",
    role: "주인공",
    kind: "hero",
    accent: "#a8d4ff",
    art: knight,
    scenes: [knight1, knight2],
    description:
      "이 이야기의 주인공. 흙의 마을 아래 펼쳐진 벌레들의 지하 왕국, 신성둥지를 홀로 내려가며 왕국이 무너진 이유를 파헤친다. 감정 없이 침묵만 지킨다는 말을 자주 듣고, 몸집이 워낙 작아 누구와 이야기하든 늘 상대를 올려다본다.",
  },
  {
    id: "hornet",
    name: "Hornet",
    nameKo: "호넷",
    role: "신성둥지의 수호자",
    kind: "npc",
    accent: "#e0334a",
    art: hornet,
    scenes: [hornet1, hornet2],
    description:
      "녹색 거리에서 처음 마주치는 붉은 망토의 전사. 바늘과 실을 무기로 쓴다. 폐허 속에서 깨어나는 무언가를 감지한 그녀는 기사의 정체를 꿰뚫어 본 듯 앞길을 가로막고, 패배한 뒤에는 여정에 꼭 필요한 '나방 날개 망토'를 남기고 사라진다. 후속작 실크송의 주인공.",
  },
  {
    id: "quirrel",
    name: "Quirrel",
    nameKo: "퀴렐",
    role: "방랑하는 탐험가",
    kind: "npc",
    accent: "#8fd0d8",
    art: quirrel,
    scenes: [quirrel1, quirrel2],
    description:
      "커다란 가면을 모자처럼 눌러쓴 여행자. 신성둥지의 신비를 제 눈으로 보기 위해 왔다. 검은 알의 신전에서 처음 만난 뒤 여러 지역에서 다시 마주치며, 이따금 갈 길을 귀띔해 준다. 잃어버린 기억을 좇아 황무지를 건너온 그의 여정은 프리퀄 코믹스로도 그려졌다.",
  },
  {
    id: "zote",
    name: "Zote",
    nameKo: "조트",
    role: "자칭 '강대한 조트'",
    kind: "npc",
    accent: "#d6d0c2",
    art: zote,
    scenes: [zote1, zote2],
    description:
      "신성둥지 최고의 개그 캐릭터이자 미친 존재감. 스스로를 '강대한 조트'라 부르며 허세를 부리지만 실력은 영 따라주지 않는다. 구해 줘도 고마워할 줄 모르고, 틈만 나면 자신의 '57가지 계율'을 늘어놓는다.",
  },
  {
    id: "mantis-lords",
    name: "Mantis Lords",
    nameKo: "사마귀 군주",
    role: "사마귀 부족의 지도자",
    kind: "boss",
    accent: "#9fb7b4",
    art: mantisLords,
    scenes: [mantis1, mantis2],
    description:
      "사마귀 부족을 이끄는 최강의 전사들. 가느다란 대못 창을 들고 눈부신 속도로 몰아친다. 사마귀 마을 가장 깊은 곳, 높은 왕좌에서 도전자를 기다리는 그들은 쓰러뜨려도 목숨을 거두지 않는다 — 대신 승자에게 예를 갖춰 고개를 숙이는, 몇 안 되는 명예로운 보스.",
  },
  {
    id: "false-knight",
    name: "False Knight",
    nameKo: "거짓 기사",
    role: "잊혀진 교차로의 보스",
    kind: "boss",
    accent: "#a7b0e0",
    art: falseKnight,
    scenes: [false1, false2],
    description:
      "잊혀진 교차로에서 기사를 기다리는 첫 번째 거대한 적. 육중한 갑옷과 철퇴를 휘두르지만, 갑옷 속에 숨은 정체는 뜻밖에도 작은 구더기다. 강해지고 싶다는 열망 하나로 훔친 갑옷을 입고 거짓 기사가 되었다.",
  },
  {
    id: "dung-defender",
    name: "Dung Defender",
    nameKo: "쇠똥구리 수호기사",
    role: "왕도의 수로의 수호자",
    kind: "boss",
    accent: "#d29a62",
    art: dungDefender,
    scenes: [dung1, dung2],
    description:
      "왕도의 수로 한가운데에 사는 노련한 전사. 단단히 뭉친 배설물 공을 굴리고 던지며 싸운다. 기사가 들어서기도 전에 호탕한 웃음으로 맞이하고, 지쳐 쓰러지면서도 웃음을 잃지 않는다. 그를 이기면 '수호기사의 문장' 부적을 얻고, 이후에는 친구처럼 대화를 나눌 수 있다.",
  },
  {
    id: "soul-master",
    name: "Soul Master",
    nameKo: "영혼 성소의 주인",
    role: "눈물의 도시의 보스",
    kind: "boss",
    accent: "#ffb065",
    art: soulMaster,
    scenes: [soul1, soul2],
    description:
      "영혼 성소의 우두머리. 신성둥지를 덮친 역병을 막겠다는 희망으로 영혼을 모으기 시작했지만, 끝내 그 힘에 취해 버렸다.",
    quote: "왕은 쓰러져도, 나는 영원히 살아간다! 내 꿈은 영원하고, 나 또한 그러하다!",
  },
  {
    id: "broken-vessel",
    name: "Broken Vessel",
    nameKo: "부서진 그릇",
    role: "고대의 분지의 보스",
    kind: "boss",
    accent: "#ff9a3c",
    art: brokenVessel,
    scenes: [broken1, broken2],
    description:
      "감염된 기생충에 의해 다시 움직이게 된 산산조각 난 몸. 쓰러뜨리면 잠시 의식이 돌아온 듯 기사에게 손을 뻗지만 이내 무너져 내린다. 긴 망토와 유난히 긴 뿔 — 그 모습은 어딘가 기사를 닮았다.",
    quote: "이 형상은… 전에도 본 적이 있다. 신성둥지의 벌레와 닮았지만 같지는 않다. 이 공허한 작은 방랑자들은 어디에서 온 것일까?",
  },
];
