"use client";

import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import type { ReactNode, JSX as ReactJSX } from "react";

import { BLOCK_DEFINITIONS } from "@/lib/builder/definitions";
import { selectBlocks, selectSelectedBlock, useBuilderStore } from "@/lib/builder/store";

const BlockCard = ({
  isSelected,
  title,
  description,
  onSelect,
  onRemove,
  children,
}: {
  isSelected: boolean;
  title: string;
  description: string;
  onSelect: () => void;
  onRemove: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={clsx(
      "group relative flex w-full flex-col gap-2 rounded-lg border px-3 py-3 text-left transition",
      isSelected
        ? "border-indigo-400 bg-indigo-950/40 text-indigo-100"
        : "border-slate-800 bg-slate-900/60 text-slate-100 hover:border-indigo-500 hover:bg-slate-900",
    )}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <span
        className="hidden rounded-md border border-slate-700 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-400 group-hover:inline-flex"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
      >
        Remove
      </span>
    </div>
    <div className="rounded-md border border-dashed border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
      {children}
    </div>
  </button>
);

const SortableBlock = ({ blockId }: { blockId: string }) => {
  const block = useBuilderStore((state) => state.blocks.find((item) => item.id === blockId));
  const selectedBlock = useBuilderStore(selectSelectedBlock);
  const selectBlock = useBuilderStore((state) => state.selectBlock);
  const removeBlock = useBuilderStore((state) => state.removeBlock);

  const definition = block ? BLOCK_DEFINITIONS[block.type] : undefined;

  const sortable = useSortable({ id: blockId });

  if (!block || !definition) {
    return null;
  }

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = sortable;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.9 : 1,
      }}
    >
      <div
        className={clsx(
          "mb-2 flex cursor-grab items-center justify-between rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-wide text-slate-500",
          {
            "border-indigo-400 text-indigo-200": selectedBlock?.id === block.id,
          },
        )}
        {...attributes}
        {...listeners}
      >
        <span>
          Drag to reorder / {definition.label}
        </span>
        <span className="text-slate-600">::</span>
      </div>
      <BlockCard
        isSelected={selectedBlock?.id === block.id}
        title={definition.label}
        description={definition.description}
        onSelect={() => selectBlock(block.id)}
        onRemove={() => removeBlock(block.id)}
      >
        <BlockPreview blockId={block.id} />
      </BlockCard>
    </div>
  );
};

const BlockPreview = ({ blockId }: { blockId: string }) => {
  const block = useBuilderStore((state) => state.blocks.find((item) => item.id === blockId));

  if (!block) {
    return null;
  }

  switch (block.type) {
    case "heading": {
      const Tag = (block.props.tag as keyof ReactJSX.IntrinsicElements) ?? "h2";
      return (
        <Tag className="text-xl font-semibold text-slate-50">
          {String(block.props.text ?? "Heading")}
        </Tag>
      );
    }
    case "text": {
      return <p className="text-sm text-slate-400">{String(block.props.text ?? "Supporting text")}</p>;
    }
    case "button": {
      const variant = String(block.props.variant ?? "primary");
      const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium";
      const styles =
        variant === "ghost"
          ? "border border-slate-700 text-slate-200 hover:border-indigo-400"
          : "bg-indigo-500 text-white hover:bg-indigo-400";

      return <span className={`${base} ${styles}`}>{String(block.props.label ?? "Button")}</span>;
    }
    case "image": {
      const src = typeof block.props.src === "string" ? block.props.src : "";
      const alt = typeof block.props.alt === "string" ? block.props.alt : "Image alt text";
      return (
        <div className="relative w-full overflow-hidden rounded-md border border-slate-800">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt} className="h-full w-full object-cover" />
          ) : (
            <div className="aspect-video bg-slate-950/60" />
          )}
          <p className="px-2 py-1 text-xs text-slate-500">{alt}</p>
        </div>
      );
    }
    case "code": {
      return (
        <pre className="max-h-32 overflow-auto rounded-md bg-slate-950/80 p-2 text-[11px] leading-relaxed text-slate-400">
          {String(block.props.code ?? "<div>Custom embed</div>")}
        </pre>
      );
    }
    case "section": {
      return (
        <div className="rounded-md border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
          <p className="text-base font-semibold text-slate-100">{String(block.props.title ?? "Section")}</p>
          <p className="mt-1 text-xs text-slate-400">{String(block.props.text ?? "Use this section to highlight content.")}</p>
        </div>
      );
    }
    default:
      return null;
  }
};

export const BuilderCanvas = () => {
  const blocks = useBuilderStore(selectBlocks);
  const moveBlock = useBuilderStore((state) => state.moveBlock);
  const selectBlock = useBuilderStore((state) => state.selectBlock);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    moveBlock(String(active.id), String(over.id));
  };

  if (blocks.length === 0) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center text-slate-400"
        onClick={() => selectBlock(undefined)}
      >
        <p className="text-base font-semibold text-slate-200">Start building your page</p>
        <p className="mt-2 max-w-md text-sm">
          Choose a block from the left panel to add content. Drag blocks vertically to reorder them as you go.
        </p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
          {blocks.map((block) => (
            <SortableBlock key={block.id} blockId={block.id} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
