import { audio } from "./audio";
import { reducedMotion } from "./prefs";
import { withBase } from "../lib/paths";

/** Answers the Seer can give from memory when the oracle endpoint is unavailable. */
const DREAMS: Record<string, string> = {
  "역병은 어디에서 시작됐나요?":
    "…그건 잊힌 빛의 꿈에서 비롯되었단다. 오래전 이 땅의 벌레들은 '빛'이라는 존재를 섬겼지. 창백한 왕이 나타나 그 신앙이 지워지자, 잊힌 빛은 벌레들의 꿈속으로 스며들어 그들을 사로잡았단다. 그것이 너희가 '감염'이라 부르는 주홍빛 역병이란다.",
  "창백한 왕은 어떤 존재인가요?":
    "…창백한 왕은 신성둥지를 세운 군주란다. 본래 거대한 웜이었던 그는 벌레의 모습을 하고 이 땅에 지혜와 문명을 주었지. 역병을 가두기 위해 공허에서 수많은 '그릇'을 빚어냈고, 그중 하나가 할로우 나이트였단다… 그 대가가 얼마나 컸는지는 너도 곧 알게 되겠지.",
  "실크송은 어떤 이야기인가요?":
    "…그건 호넷의 꿈이란다. 신성둥지의 공주이자 수호자였던 그녀는 낯선 이들에게 붙잡혀 실과 노래가 다스리는 왕국, 파롬으로 끌려가지. 그곳에서 그녀는 빛나는 성채의 꼭대기를 향한 순례를 시작한단다. 2025년 가을, 그 꿈은 마침내 현실이 되었지.",
};

const MESSAGES = {
  asleep: "…예언자는 지금 깊은 꿈에 잠겨 있단다. (이 배포 환경에는 AI 예언자가 설정되어 있지 않아요.)",
  busy: "…꿈을 너무 많이 들여다봤구나. 잠시 숨을 고른 뒤 다시 물어봐 주겠니?",
  lost: "…꿈이 흐려졌구나. 조금 뒤에 다시 물어봐 주겠니?",
  short: "…조금 더 자세히 말해 주겠니?",
};

export function initSeer() {
  const form = document.querySelector<HTMLFormElement>("[data-seer-form]");
  const input = document.querySelector<HTMLInputElement>("[data-seer-input]");
  const out = document.querySelector<HTMLElement>("[data-seer-answer]");
  const thinking = document.querySelector<HTMLElement>("[data-seer-thinking]");
  const submit = document.querySelector<HTMLButtonElement>("[data-seer-submit]");
  if (!form || !input || !out || !thinking || !submit) return;

  let busy = false;
  let typing = 0;

  /** Dialogue-box typewriter; click the box to skip ahead. */
  const say = (text: string) => {
    window.clearInterval(typing);
    out.style.opacity = "1";
    if (reducedMotion()) {
      out.textContent = text;
      return;
    }
    const chars = [...text];
    let i = 0;
    out.textContent = "";
    const caret = Object.assign(document.createElement("span"), { className: "caret" });
    out.append(caret);
    typing = window.setInterval(() => {
      i = Math.min(chars.length, i + 2);
      out.textContent = chars.slice(0, i).join("");
      if (i < chars.length) out.append(caret);
      else window.clearInterval(typing);
    }, 32);
    out.addEventListener(
      "click",
      () => {
        window.clearInterval(typing);
        out.textContent = text;
      },
      { once: true },
    );
  };

  const ask = async (question: string) => {
    const q = question.trim();
    if (busy) return;
    if (q.length < 2) return say(MESSAGES.short);
    busy = true;
    submit.disabled = true;
    thinking.hidden = false;
    out.style.opacity = "0.35";
    let answer = "";
    try {
      const res = await fetch(withBase("api/seer"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
        signal: AbortSignal.timeout(25000),
      });
      const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
      if (res.ok && data.answer) answer = data.answer;
      else if (DREAMS[q]) answer = DREAMS[q];
      else if (res.status === 429) answer = MESSAGES.busy;
      else if (data.error === "not_configured" || res.status === 404) answer = MESSAGES.asleep;
      else answer = MESSAGES.lost;
    } catch {
      answer = DREAMS[q] ?? MESSAGES.lost;
    } finally {
      busy = false;
      submit.disabled = false;
      thinking.hidden = true;
    }
    audio.play("seer");
    say(answer);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    void ask(input.value);
  });
  document.querySelectorAll<HTMLButtonElement>("[data-seer-suggest]").forEach((chip) =>
    chip.addEventListener("click", () => {
      input.value = chip.textContent?.trim() ?? "";
      void ask(input.value);
    }),
  );
}
