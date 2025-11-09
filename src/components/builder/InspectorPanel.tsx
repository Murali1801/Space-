"use client";

import { Fragment, type ReactNode } from "react";

import { BLOCK_DEFINITIONS } from "@/lib/builder/definitions";
import { selectSelectedBlock, useBuilderStore } from "@/lib/builder/store";

const Field = ({
  label,
  description,
  input,
}: {
  label: string;
  description?: string;
  input: ReactNode;
}) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
    {description ? <span className="text-xs text-slate-500">{description}</span> : null}
    {input}
  </label>
);

export function InspectorPanel() {
  const selectedBlock = useBuilderStore(selectSelectedBlock);
  const updateBlockProps = useBuilderStore((state) => state.updateBlockProps);

  if (!selectedBlock) {
    return (
      <div className="flex flex-1 flex-col rounded-lg border border-slate-800 bg-slate-900/50">
        <div className="border-b border-slate-800 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Inspector</h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-slate-400">
          <p className="text-base font-semibold text-slate-200">Select a block to edit</p>
          <p>Click any block on the canvas to edit its content and settings here.</p>
        </div>
      </div>
    );
  }

  const definition = BLOCK_DEFINITIONS[selectedBlock.type];

  const update = (props: Record<string, unknown>) => {
    updateBlockProps(selectedBlock.id, props);
  };

  return (
    <div className="flex flex-1 flex-col rounded-lg border border-slate-800 bg-slate-900/50">
      <div className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Inspector</h2>
        <p className="text-xs text-slate-500">{definition.label}</p>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 text-sm text-slate-100">
        {selectedBlock.type === "heading" ? (
          <Fragment>
            <Field
              label="Heading text"
              input={
                <textarea
                  value={String(selectedBlock.props.text ?? "")}
                  onChange={(event) => update({ text: event.target.value })}
                  className="h-24 w-full resize-none rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
                />
              }
            />
            <Field
              label="HTML tag"
              input={
                <select
                  value={String(selectedBlock.props.tag ?? "h2")}
                  onChange={(event) => update({ tag: event.target.value })}
                  className="rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
                >
                  {Array.from({ length: 6 }, (_, index) => `h${index + 1}`).map((tag) => (
                    <option key={tag} value={tag}>
                      {tag.toUpperCase()}
                    </option>
                  ))}
                </select>
              }
            />
          </Fragment>
        ) : null}

        {selectedBlock.type === "text" ? (
          <Field
            label="Text"
            input={
              <textarea
                value={String(selectedBlock.props.text ?? "")}
                onChange={(event) => update({ text: event.target.value })}
                className="h-32 w-full resize-none rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
              />
            }
          />
        ) : null}

        {selectedBlock.type === "button" ? (
          <Fragment>
            <Field
              label="Label"
              input={
                <input
                  value={String(selectedBlock.props.label ?? "")}
                  onChange={(event) => update({ label: event.target.value })}
                  className="rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
                />
              }
            />
            <Field
              label="Link"
              input={
                <input
                  value={String(selectedBlock.props.href ?? "")}
                  onChange={(event) => update({ href: event.target.value })}
                  className="rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
                />
              }
            />
            <Field
              label="Variant"
              input={
                <select
                  value={String(selectedBlock.props.variant ?? "primary")}
                  onChange={(event) => update({ variant: event.target.value })}
                  className="rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
                >
                  <option value="primary">Primary</option>
                  <option value="ghost">Ghost</option>
                </select>
              }
            />
          </Fragment>
        ) : null}

        {selectedBlock.type === "image" ? (
          <Fragment>
            <Field
              label="Image URL"
              description="Soon this will connect to Cloudinary"
              input={
                <input
                  value={String(selectedBlock.props.src ?? "")}
                  onChange={(event) => update({ src: event.target.value })}
                  className="rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
                />
              }
            />
            <Field
              label="Alt text"
              input={
                <input
                  value={String(selectedBlock.props.alt ?? "")}
                  onChange={(event) => update({ alt: event.target.value })}
                  className="rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
                />
              }
            />
          </Fragment>
        ) : null}

        {selectedBlock.type === "code" ? (
          <Field
            label="Custom HTML / Liquid"
            input={
              <textarea
                value={String(selectedBlock.props.code ?? "")}
                onChange={(event) => update({ code: event.target.value })}
                className="h-40 w-full resize-none rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs font-mono text-slate-200 focus:border-indigo-400 focus:outline-none"
              />
            }
          />
        ) : null}

        {selectedBlock.type === "section" ? (
          <Fragment>
            <Field
              label="Title"
              input={
                <input
                  value={String(selectedBlock.props.title ?? "")}
                  onChange={(event) => update({ title: event.target.value })}
                  className="rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
                />
              }
            />
            <Field
              label="Description"
              input={
                <textarea
                  value={String(selectedBlock.props.text ?? "")}
                  onChange={(event) => update({ text: event.target.value })}
                  className="h-24 w-full resize-none rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
                />
              }
            />
          </Fragment>
        ) : null}
      </div>
    </div>
  );
}
