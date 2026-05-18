import { makeAutoObservable } from 'mobx';
import type { Block } from '@types/document';
import { v4 as uuidv4 } from 'uuid';
import { authStore } from '@stores/AuthStore';
import JSZip from 'jszip';

class EditorStore {
    documentId: string | null = null;
    title: string = '';
    description: string = '';
    blocks: Map<string, Block> = new Map();
    rootBlockIds: string[] = [];
    selectedBlockId: string | null = null;
    isLoading: boolean = false;
    error: string | null = null;

    // Хранилище медиафайлов (path -> content)
    mediaFiles: Map<string, Uint8Array> = new Map();

    constructor() {
        makeAutoObservable(this);
    }

    setLoading(loading: boolean) {
        this.isLoading = loading;
    }

    setError(error: string | null) {
        this.error = error;
    }

    setDocument(documentId: string, title: string, description: string, blocks: Block[], rootIds: string[]) {
        this.documentId = documentId;
        this.title = title;
        this.description = description;
        this.blocks.clear();
        blocks.forEach(block => this.blocks.set(block.id, block));
        this.rootBlockIds = rootIds;
    }

    setSelectedBlockId(blockId: string | null) {
        this.selectedBlockId = blockId;
    }

    addBlock(parentId: string | null, block: Block) {
        this.blocks.set(block.id, block);
        if (parentId === null) {
            this.rootBlockIds.push(block.id);
        } else {
            const parent = this.blocks.get(parentId);
            if (parent) {
                const children = parent.children || [];
                parent.children = [...children, block];
            }
        }
    }

    updateBlock(blockId: string, updates: Partial<Block>) {
        const block = this.blocks.get(blockId);
        if (block) {
            Object.assign(block, updates);
            this.blocks.set(blockId, block);
        }
    }

    deleteBlock(blockId: string) {
        this.rootBlockIds = this.rootBlockIds.filter(id => id !== blockId);
        this.blocks.forEach(block => {
            if (block.children) {
                block.children = block.children.filter(child => child.id !== blockId);
            }
        });
        this.blocks.delete(blockId);
        if (this.selectedBlockId === blockId) {
            this.selectedBlockId = null;
        }
    }

    moveBlock(blockId: string, targetIndex: number) {
        const currentIndex = this.rootBlockIds.findIndex(id => id === blockId);
        if (currentIndex === -1) return;
        const [moved] = this.rootBlockIds.splice(currentIndex, 1);
        this.rootBlockIds.splice(targetIndex, 0, moved);
    }

    duplicateBlock(blockId: string) {
        const original = this.blocks.get(blockId);
        if (!original) return;
        const newId = uuidv4();
        const duplicate = { ...original, id: newId, children: original.children ? [...original.children] : [] };
        this.blocks.set(newId, duplicate);
        const index = this.rootBlockIds.findIndex(id => id === blockId);
        if (index !== -1) {
            this.rootBlockIds.splice(index + 1, 0, newId);
        }
    }

    clear() {
        this.documentId = null;
        this.title = '';
        this.description = '';
        this.blocks.clear();
        this.rootBlockIds = [];
        this.selectedBlockId = null;
        this.error = null;
        this.mediaFiles.clear();
    }

    get selectedBlock(): Block | null {
        return this.selectedBlockId ? this.blocks.get(this.selectedBlockId) || null : null;
    }

    get hasBlocks(): boolean {
        return this.rootBlockIds.length > 0;
    }

    // === Медиафайлы ===

    addMediaFile(path: string, content: Uint8Array) {
        this.mediaFiles.set(path, content);
    }

    getMediaFile(path: string): Uint8Array | undefined {
        return this.mediaFiles.get(path);
    }

    removeMediaFile(path: string) {
        this.mediaFiles.delete(path);
    }

    clearMediaFiles() {
        this.mediaFiles.clear();
    }

    // === Сериализация в .doceo ===

    async serializeToDoceo(): Promise<Uint8Array> {
        const buildTree = (blockId: string): any => {
            const block = this.blocks.get(blockId);
            if (!block) return null;

            const result: any = { id: block.id, type: block.type };

            Object.keys(block).forEach(key => {
                if (key !== 'id' && key !== 'type' && key !== 'children') {
                    result[key] = (block as any)[key];
                }
            });

            if ((block as any).children && (block as any).children.length > 0) {
                result.children = (block as any).children.map((child: any) => buildTree(child.id));
            }

            return result;
        };

        const rootBlocks = this.rootBlockIds.map(id => buildTree(id)).filter(Boolean);
        const contentJson = { root: rootBlocks };

        // Собираем assets из медиафайлов
        const assets: { path: string; sha256: string }[] = [];

        for (const [path, content] of this.mediaFiles.entries()) {
            const hashBuffer = await crypto.subtle.digest('SHA-256', content);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            assets.push({ path, sha256: hashHex });
        }

        const manifest = {
            version: '1.0',
            meta: {
                id: this.documentId,
                title: this.title,
                author_id: authStore.user?.id || 'unknown',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            content_filename: 'content.json',
            assets: assets,
            content_sha256: '',
        };

        const zip = new JSZip();
        zip.file('manifest.json', JSON.stringify(manifest, null, 2));
        zip.file('content.json', JSON.stringify(contentJson, null, 2));

        // Добавляем медиафайлы в ZIP
        for (const [path, content] of this.mediaFiles.entries()) {
            zip.file(path, content);
        }

        return await zip.generateAsync({ type: 'uint8array' });
    }
}

export const editorStore = new EditorStore();