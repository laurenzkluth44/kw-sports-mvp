import Image from "next/image";
import Link from "next/link";
import { FileDown, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { SHOTS, type GuideKind } from "./index";
import { splitStep } from "./text";
import type { HelpChrome, HelpGuide, HelpTopic } from "./types";

/** Step text with [[UI label]] parts shown like the buttons and fields on screen. */
export function StepText({ text }: { text: string }) {
  return (
    <>
      {splitStep(text).map((part, index) =>
        part.chip ? (
          <span
            key={index}
            className="mx-0.5 inline-block whitespace-nowrap border border-navy-950/15 bg-white px-1.5 py-px align-baseline text-[0.78rem] font-bold uppercase tracking-[0.06em] text-navy-950 shadow-[0_1px_0_rgba(10,10,10,0.08)]"
          >
            {part.text}
          </span>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  );
}

function Topic({ topic, chrome, sectionId }: { topic: HelpTopic; chrome: HelpChrome; sectionId: string }) {
  const shot = topic.shot ? SHOTS[topic.shot] : undefined;
  return (
    <article id={`${sectionId}-${topic.id}`} className="min-w-0 scroll-mt-28 border-t border-slate-100 px-5 py-6 first:border-t-0">
      <div className={cn("grid min-w-0 gap-6", shot && "lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]")}>
        <div className="min-w-0">
          <h3 className="font-display text-2xl uppercase leading-none text-navy-950 sm:text-[1.7rem]">{topic.title}</h3>
          <p className="mt-1.5 text-sm text-slate-500">{topic.goal}</p>
          <ol className="mt-4 space-y-3">
            {topic.steps.map((step, index) => (
              <li key={index} className="flex gap-3 text-[0.95rem] leading-7 text-slate-800">
                <span
                  aria-label={`${chrome.step} ${index + 1}`}
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-brand-500 font-display text-base leading-none text-white"
                >
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <StepText text={step} />
                </span>
              </li>
            ))}
          </ol>
          {topic.tip ? (
            <p className="mt-4 flex gap-2 border-l-2 border-brand-500 bg-brand-50 px-4 py-3 text-sm leading-6 text-navy-950">
              <Lightbulb className="mt-1 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <span>
                <span className="font-bold">{chrome.tip}: </span>
                <StepText text={topic.tip} />
              </span>
            </p>
          ) : null}
        </div>
        {shot ? (
          <a href={shot.src} target="_blank" rel="noreferrer" className="group block min-w-0 self-start">
            {/* Screenshot of the real screen; opens full size in a new tab. */}
            <Image
              unoptimized
              src={shot.src}
              width={shot.width}
              height={shot.height}
              alt={topic.title}
              loading="lazy"
              className="block max-h-[22rem] w-full border border-slate-200 object-cover object-top shadow-card transition-shadow group-hover:shadow-cardHover"
            />
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function HelpView({
  guide,
  chrome,
  kind,
  switchable,
  pdfHref
}: {
  guide: HelpGuide;
  chrome: HelpChrome;
  kind: GuideKind;
  /** Admins can switch between the three guides. */
  switchable: boolean;
  /** "Erste Schritte" PDF, only on the club guide. */
  pdfHref?: string;
}) {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow={chrome.eyebrow} title={guide.title} description={guide.intro} />

      {switchable ? (
        <nav aria-label={chrome.eyebrow} className="flex flex-wrap gap-2">
          {(["club", "agency", "admin"] as const).map((key) => (
            <Link
              key={key}
              href={`/help?guide=${key}`}
              prefetch={false}
              aria-current={key === kind ? "page" : undefined}
              className={cn(
                "inline-flex min-h-10 items-center border px-4 text-[0.8rem] font-bold uppercase tracking-[0.08em]",
                key === kind ? "border-navy-950 bg-navy-950 text-white" : "border-slate-300 bg-white text-navy-950 hover:border-brand-500"
              )}
            >
              {chrome.guides[key]}
            </Link>
          ))}
        </nav>
      ) : null}

      <div className="grid min-w-0 gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-40">
          <nav aria-label={chrome.contents} className="panel px-5 py-4">
            <p className="eyebrow">{chrome.contents}</p>
            <ol className="mt-3 space-y-3">
              {guide.sections.map((section, sectionIndex) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-sm font-bold text-navy-950 hover:text-brand-600">
                    {sectionIndex + 1}. {section.title}
                  </a>
                  <ul className="mt-1 space-y-1 border-l border-slate-200 pl-3">
                    {section.topics.map((topic) => (
                      <li key={topic.id}>
                        <a href={`#${section.id}-${topic.id}`} className="block text-[0.82rem] leading-5 text-slate-600 hover:text-brand-600">
                          {topic.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </nav>

          {pdfHref ? (
            <a href={pdfHref} download className="block bg-navy-950 px-5 py-4 text-white transition-colors hover:bg-black">
              <span className="flex items-center gap-2 text-[0.8rem] font-bold uppercase tracking-[0.08em]">
                <FileDown className="h-4 w-4 text-brand-300" aria-hidden="true" />
                {chrome.pdf}
              </span>
              <span className="mt-1 block text-xs leading-5 text-white/70">{chrome.pdfHint}</span>
            </a>
          ) : null}
        </aside>

        <div className="min-w-0 space-y-5">
          {chrome.screenshotNote ? <p className="text-xs text-slate-500">{chrome.screenshotNote}</p> : null}
          {guide.sections.map((section, sectionIndex) => (
            <section key={section.id} id={section.id} className="panel min-w-0 scroll-mt-28 overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
                <p className="eyebrow">
                  {String(sectionIndex + 1).padStart(2, "0")} · {section.title}
                </p>
              </div>
              {section.topics.map((topic) => (
                <Topic key={topic.id} topic={topic} chrome={chrome} sectionId={section.id} />
              ))}
            </section>
          ))}
          <p className="text-sm text-slate-600">{chrome.contact}</p>
        </div>
      </div>
    </div>
  );
}
