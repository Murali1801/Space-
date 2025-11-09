"use client";

import { Fragment, useRef, type ReactNode } from "react";

import { BLOCK_DEFINITIONS } from "@/lib/builder/definitions";
import { selectSelectedBlock, useBuilderStore } from "@/lib/builder/store";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";

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

const UploadButton = ({
  onSelect,
  status,
}: {
  onSelect: (file: File) => void;
  status: string;
}) => {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    fileRef.current?.click();
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onSelect(file);
            event.target.value = "";
          }
        }}
      />
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md border border-indigo-500 px-3 py-1.5 text-xs font-medium text-indigo-200 transition hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
        disabled={status === "signing" || status === "uploading"}
      >
        {status === "uploading" || status === "signing" ? "Uploading…" : "Upload image"}
      </button>
      {(status === "error" || status === "success") && (
        <span
          className={
            status === "success"
              ? "text-xs text-slate-500"
              : "text-xs text-red-400"
          }
        >
          {status === "success" ? "Uploaded" : "Upload failed"}
        </span>
      )}
    </div>
  );
};

export function InspectorPanel() {
  const selectedBlock = useBuilderStore(selectSelectedBlock);
  const updateBlockProps = useBuilderStore((state) => state.updateBlockProps);
  const { upload, status: uploadStatus } = useCloudinaryUpload();
  const selectedBlockId = selectedBlock?.id;

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
    if (!selectedBlockId) {
      return;
    }
    updateBlockProps(selectedBlockId, props);
  };

  const handleImageUpload = async (file: File) => {
    const result = await upload(file);

    if (result) {
      update({
        src: result.secureUrl,
        alt: result.originalFilename ?? selectedBlock.props.alt ?? "",
        cloudinaryAssetId: result.assetId,
        cloudinaryPublicId: result.publicId,
        width: result.width,
        height: result.height,
      });
    }
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
              label="Image"
              description="Upload a new asset or paste an existing URL"
              input={
                <div className="flex flex-col gap-2">
                  <UploadButton onSelect={handleImageUpload} status={uploadStatus} />
                  <input
                    value={String(selectedBlock.props.src ?? "")}
                    onChange={(event) => update({ src: event.target.value })}
                    className="rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
                    placeholder="https://"
                  />
                </div>
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
