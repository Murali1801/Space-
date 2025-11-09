export type BlockType =
  | "section"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "code";

export interface BlockDefinition<TProps extends Record<string, unknown>> {
  type: BlockType;
  label: string;
  description: string;
  group: string;
  icon: string;
  defaults: TProps;
}

export interface BlockInstance<TProps extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  type: BlockType;
  props: TProps;
}

export type BlockDefinitionMap = Record<BlockType, BlockDefinition<Record<string, unknown>>>;
