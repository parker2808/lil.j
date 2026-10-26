import { useState } from "react";
import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { Spark } from "../components/Fireworks.tsx";
import { useI18n } from "../lib/locale-context.ts";
import { fillTemplate } from "../lib/pure.ts";
import type { ChapterProps } from "../types.ts";

export function Quiz({ progress, update }: ChapterProps) {
  const { t } = useI18n();
  const chapter = content.chapters.find((item) => item.id === "quiz");
  const total = content.quiz.length;
  const answered = content.quiz.filter((question) => typeof progress.quiz[question.id] === "number").length;
  const [step, setStep] = useState(answered >= total ? total : answered);
  const [cheer, setCheer] = useState(0);
  const question = content.quiz[step];
  const correct = content.quiz.filter((item) => progress.quiz[item.id] === item.answer).length;

  function choose(index: number) {
    if (!question || typeof progress.quiz[question.id] === "number") return;
    update((current) => ({
      ...current,
      quiz: { ...current.quiz, [question.id]: index },
    }));
    if (index === question.answer) setCheer((count) => count + 1);
  }

  return (
    <ChapterFrame
      kicker={t(chapter?.kicker)}
      title={t(chapter?.title)}
      lede={t(chapter?.lede)}
    >
      {question ? (
        <div className="quiz">
          <Spark play={cheer} />
          <p className="count">
            {step + 1}/{total}
          </p>
          <h2>{t(question.question)}</h2>
          <div className="options">
            {question.options.map((option, index) => {
              const picked = progress.quiz[question.id];
              const locked = typeof picked === "number";
              const className = [
                "option",
                locked && index === question.answer ? "is-right" : "",
                locked && index === picked && index !== question.answer ? "is-wrong" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={`${question.id}-${index}`}
                  type="button"
                  className={className}
                  disabled={locked}
                  onClick={() => choose(index)}
                >
                  <span className="opt-index" aria-hidden="true">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{t(option)}</span>
                </button>
              );
            })}
          </div>
          {typeof progress.quiz[question.id] === "number" && (
            <>
              <p className={progress.quiz[question.id] === question.answer ? "quiz-note is-right" : "quiz-note"}>
                {progress.quiz[question.id] === question.answer ? t(question.rightNote) : t(question.wrongNote)}
              </p>
              <button type="button" className="btn" onClick={() => setStep(step + 1)}>
                {step + 1 >= total ? t(content.ui.summaryTitle) : t(content.ui.nextQuestion)}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="quiz">
          <h2>{t(content.ui.summaryTitle)}</h2>
          <p className="lede">{fillTemplate(t(content.quizSummary), { ok: correct, total })}</p>
          <button type="button" className="btn" onClick={() => setStep(0)}>
            {t(content.ui.seeAgain)}
          </button>
        </div>
      )}
    </ChapterFrame>
  );
}
