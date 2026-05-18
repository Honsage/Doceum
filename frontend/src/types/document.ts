// Inline узлы для форматированного текста
export interface InlineSpan {
    type: 'span';
    text: string;
    marks?: ('bold' | 'italic' | 'underline' | 'strikethrough')[];
}

export interface InlineCode {
    type: 'inline_code';
    code: string;
}

export interface InlineFormula {
    type: 'inline_formula';
    latex: string;
}

export interface CopySnippet {
    type: 'copy_snippet';
    text: string;
}

export interface LinkInline {
    type: 'link';
    href: string;
    content: InlineNode[];
}

export interface AnchorLinkInline {
    type: 'anchor_link';
    targetId: string;
    content: InlineNode[];
}

export interface SpoilerInline {
    type: 'spoiler';
    content: InlineNode[];
}

export type InlineNode =
    | InlineSpan
    | InlineCode
    | InlineFormula
    | CopySnippet
    | LinkInline
    | AnchorLinkInline
    | SpoilerInline;

// Текстовый контент (содержит массив inline узлов)
export interface TextContent {
    type: 'text';
    inlines: InlineNode[];
}

// Базовый блок
export interface BaseBlock {
    id: string;
    type: string;
    children?: Block[];
}

// Конкретные типы блоков
export interface HeadingBlock extends BaseBlock {
    type: 'heading';
    level: 1 | 2 | 3 | 4 | 5 | 6;
    content: TextContent;
}

export interface ParagraphBlock extends BaseBlock {
    type: 'paragraph';
    content: TextContent;
}

export interface CodeBlock extends BaseBlock {
    type: 'code';
    language: string;
    code: string;
}

export interface ImageBlock extends BaseBlock {
    type: 'image';
    src: string;
    alt: string;
    caption?: string;
}

export interface VideoBlock extends BaseBlock {
    type: 'video';
    srcType: 'file' | 'url';
    src: string;
    aspectRatio?: string;
}

export interface TabsBlock extends BaseBlock {
    type: 'tabs';
    children: TabItemBlock[];
}

export interface TabItemBlock extends BaseBlock {
    type: 'tab_item';
    label: TextContent;
    children: Block[];
}

export interface StepperBlock extends BaseBlock {
    type: 'stepper';
    children: StepItemBlock[];
}

export interface StepItemBlock extends BaseBlock {
    type: 'step_item';
    label: TextContent;
    children: Block[];
}

export interface AccordionBlock extends BaseBlock {
    type: 'accordion';
    label: TextContent;
    children: Block[];
}

export interface ListBlock extends BaseBlock {
    type: 'list';
    listType: 'ordered' | 'unordered' | 'checklist';
    children: ParagraphBlock[];
}

export interface CalloutBlock extends BaseBlock {
    type: 'callout';
    calloutType: 'info' | 'tip' | 'warning' | 'danger';
    children: Block[];
}

export interface QuoteBlock extends BaseBlock {
    type: 'quote';
    children: Block[];
}

export interface DividerBlock extends BaseBlock {
    type: 'divider';
}

export interface QuizBlock extends BaseBlock {
    type: 'quiz';
    inputType: 'radio' | 'checkbox' | 'text';
    question: TextContent;
    options?: Array<{
        id: string;
        content: (TextContent | ImageBlock)[];
    }>;
    correct?: string[];
    correctPattern?: {
        match: 'exact' | 'regex';
        pattern: string;
        flags?: string;
    };
}

export interface TableBlock extends BaseBlock {
    type: 'table';
    caption?: TextContent;
    head?: TableRow[];
    body?: TableRow[];
}

export interface TableRow {
    id: string;
    cells: TableCell[];
}

export interface TableCell {
    id: string;
    isHeader: boolean;
    content: TextContent;
}

export interface FormulaBlock extends BaseBlock {
    type: 'formula';
    latex: string;
}

export interface DiagramBlock extends BaseBlock {
    type: 'diagram';
    syntax: 'mermaid';
    code: string;
}

export interface CanvasBlock extends BaseBlock {
    type: 'canvas';
    width: number;
    height: number;
    src: string;
}

export type Block =
    | HeadingBlock
    | ParagraphBlock
    | CodeBlock
    | ImageBlock
    | VideoBlock
    | TabsBlock
    | TabItemBlock
    | StepperBlock
    | StepItemBlock
    | AccordionBlock
    | ListBlock
    | CalloutBlock
    | QuoteBlock
    | DividerBlock
    | QuizBlock
    | TableBlock
    | FormulaBlock
    | DiagramBlock
    | CanvasBlock;

// Распарсенный документ
export interface ParsedDocument {
    manifest: {
        id: string;
        title: string;
        authorId: string;
        createdAt: string;
        updatedAt: string;
        contentSha256: string;
        hasSignature: boolean;
    };
    content: {
        root: Block[];
    };
}