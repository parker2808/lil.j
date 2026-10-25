import { useState } from "react";
import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { fillTemplate } from "../lib/pure.ts";
import type { ChapterProps } from "../types.ts";

export function Quiz({ progress, update, onBack }: ChapterProps) {
  const chapter = content.chapters.find((item) => item.id === "quiz");
  const total = content.quiz.length;
  const answered = content.quiz.filter((question) => typeof progress.quiz[question.id] === "number").length;
  const [step, setStep] = useState(answered >= total ? total : answered);
  const question = content.quiz[step];
  const correct = content.quiz.filter((item) => progress.quiz[item.id] === item.answer).length;

  function choose(index: number) {
    if (!question || typeof progress.quiz[question.id] === "number") return;
    update((current) => ({
      ...current,
      quiz: { ...current.quiz, [question.id]: index },
    }));
  }

  return (
    <ChapterFrame
      kicker={chapter?.kicker ?? ""}
      title={chapter?.title ?? ""}
      lede={chapter?.lede ?? ""}
      onBack={onBack}
    >
      {question ? (
        <div className="quiz">
          <p className="count">
            {step + 1}/{total}
          </p>
          <h2>{question.question}</h2>
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
                  {option}
                </button>
              );
            })}
          </div>
          {typeof progress.quiz[question.id] === "number" && (
            <>
              <p className="note">
                {progress.quiz[question.id] === question.answer ? question.rightNote : question.wrongNote}
              </p>
              <button type="button" className="btn" onClick={() => setStep(step + 1)}>
                {step + 1 >= total ? content.ui.summaryTitle : content.ui.nextQuestion}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="quiz">
          <h2>{content.ui.summaryTitle}</h2>
          <p className="lede">{fillTemplate(content.quizSummary, { ok: correct, total })}</p>
          <button type="button" className="btn" onClick={() => setStep(0)}>
            {content.ui.seeAgain}
          </button>
        </div>
      )}
    </ChapterFrame>
  );
}
