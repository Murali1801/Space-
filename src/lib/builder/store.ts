import { create } from "zustand";
import { nanoid } from "nanoid";

import { BLOCK_DEFINITIONS } from "@/lib/builder/definitions";
import type { BlockInstance, BlockType } from "@/lib/builder/schema";

type BuilderState = {
  blocks: BlockInstance[];
  selectedBlockId?: string;
  addBlock: (type: BlockType, index?: number) => void;
  moveBlock: (activeId: string, overId: string) => void;
  reorderBlock: (activeId: string, newIndex: number) => void;
  selectBlock: (id?: string) => void;
  updateBlockProps: (id: string, props: Partial<BlockInstance["props"]>) => void;
  removeBlock: (id: string) => void;
  reset: () => void;
};

const withDefaults = (type: BlockType): BlockInstance => {
  const definition = BLOCK_DEFINITIONS[type];

  if (!definition) {
    throw new Error(`Unknown block type: ${type}`);
  }

  return {
    id: nanoid(8),
    type,
    props: { ...definition.defaults },
  };
};

export const useBuilderStore = create<BuilderState>((set) => ({
  blocks: [],
  selectedBlockId: undefined,
  addBlock: (type, index) => {
    set((state) => {
      const block = withDefaults(type);
      const blocks = [...state.blocks];

      if (typeof index === "number" && index >= 0 && index <= blocks.length) {
        blocks.splice(index, 0, block);
      } else {
        blocks.push(block);
      }

      return {
        blocks,
        selectedBlockId: block.id,
      };
    });
  },
  moveBlock: (activeId, overId) => {
    if (activeId === overId) {
      return;
    }

    set((state) => {
      const blocks = [...state.blocks];
      const activeIndex = blocks.findIndex((block) => block.id === activeId);
      const overIndex = blocks.findIndex((block) => block.id === overId);

      if (activeIndex === -1 || overIndex === -1) {
        return state;
      }

      const [active] = blocks.splice(activeIndex, 1);
      blocks.splice(overIndex, 0, active);

      return { blocks };
    });
  },
  reorderBlock: (activeId, newIndex) => {
    set((state) => {
      const blocks = [...state.blocks];
      const currentIndex = blocks.findIndex((block) => block.id === activeId);

      if (currentIndex === -1 || newIndex < 0 || newIndex >= blocks.length) {
        return state;
      }

      const [active] = blocks.splice(currentIndex, 1);
      blocks.splice(newIndex, 0, active);

      return { blocks };
    });
  },
  selectBlock: (id) => {
    set({ selectedBlockId: id });
  },
  updateBlockProps: (id, props) => {
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id
          ? {
              ...block,
              props: {
                ...block.props,
                ...props,
              },
            }
          : block,
      ),
    }));
  },
  removeBlock: (id) => {
    set((state) => ({
      blocks: state.blocks.filter((block) => block.id !== id),
      selectedBlockId: state.selectedBlockId === id ? undefined : state.selectedBlockId,
    }));
  },
  reset: () => set({ blocks: [], selectedBlockId: undefined }),
}));

export const selectBlocks = (state: BuilderState) => state.blocks;
export const selectSelectedBlock = (state: BuilderState) =>
  state.blocks.find((block) => block.id === state.selectedBlockId);
