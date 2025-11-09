import type { BlockDefinition, BlockDefinitionMap } from "@/lib/builder/schema";

type AnyBlockDefinition = BlockDefinition<Record<string, unknown>>;

export const BLOCK_DEFINITIONS: BlockDefinitionMap = {
  section: {
    type: "section",
    label: "Section",
    description: "Full-width container with padding",
    group: "Layout",
    icon: "container",
    defaults: {
      background: "slate-900",
      padding: "py-16 px-6",
      title: "Section title",
      text: "Use this section to highlight a product or offer.",
    },
  },
  heading: {
    type: "heading",
    label: "Heading",
    description: "Large typography for hero statements",
    group: "Content",
    icon: "heading",
    defaults: {
      text: "Craft the perfect story for your landing page",
      tag: "h2",
      alignment: "left",
    },
  },
  text: {
    type: "text",
    label: "Text",
    description: "Supporting paragraph copy",
    group: "Content",
    icon: "text",
    defaults: {
      text: "Share details about your offer, product, or promotion.",
      alignment: "left",
    },
  },
  button: {
    type: "button",
    label: "Button",
    description: "Primary call-to-action button",
    group: "Content",
    icon: "button",
    defaults: {
      label: "Shop now",
      href: "#",
      variant: "primary",
      alignment: "left",
    },
  },
  image: {
    type: "image",
    label: "Image",
    description: "Upload imagery through Cloudinary",
    group: "Content",
    icon: "image",
    defaults: {
      src: "https://res.cloudinary.com/demo/image/upload/v1700000000/sample.jpg",
      alt: "Product photo",
      aspectRatio: "16/9",
      alignment: "center",
    },
  },
  code: {
    type: "code",
    label: "Custom code",
    description: "Embed custom HTML, CSS, or Liquid",
    group: "Advanced",
    icon: "code",
    defaults: {
      code: "<div style='padding: 2rem; text-align: center;'>Custom embed</div>",
    },
  },
};

export type BlockGroup = {
  name: string;
  blocks: AnyBlockDefinition[];
};

const groupsMap = new Map<string, AnyBlockDefinition[]>();

Object.values(BLOCK_DEFINITIONS).forEach((definition) => {
  if (!groupsMap.has(definition.group)) {
    groupsMap.set(definition.group, []);
  }

  groupsMap.get(definition.group)!.push(definition as AnyBlockDefinition);
});

export const BLOCK_GROUPS: BlockGroup[] = Array.from(groupsMap.entries()).map(([name, blocks]) => ({
  name,
  blocks,
}));
