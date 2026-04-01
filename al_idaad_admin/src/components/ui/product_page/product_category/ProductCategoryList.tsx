"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/shared/AuthContext";
import { FaChevronDown, FaXmark } from "react-icons/fa6";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
    _id: string;
    name: string;
    subCategories: Category[];
}

interface CategoryListProps {
    selectedIds: string[];
    onChange: (primary: { _id: string; name: string } | null, allIds: string[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isLeaf = (cat: Category) => !cat.subCategories || cat.subCategories.length === 0;

/** Flatten all leaf nodes for resolving names from selected IDs */
const collectLeaves = (cats: Category[]): Category[] => cats.flatMap((c) => (isLeaf(c) ? [c] : collectLeaves(c.subCategories)));

// ─── Recursive tree row ───────────────────────────────────────────────────────

const TreeNode = ({
    cat,
    level,
    selectedIds,
    openIds,
    onToggleOpen,
    onToggleSelect,
}: {
    cat: Category;
    level: number;
    selectedIds: string[];
    openIds: string[];
    onToggleOpen: (id: string) => void;
    onToggleSelect: (cat: Category) => void;
}) => {
    const leaf = isLeaf(cat);
    const isOpen = openIds.includes(cat._id);
    const isSelected = selectedIds.includes(cat._id);
    const selectionIndex = selectedIds.indexOf(cat._id);

    return (
        <div>
            <div
                onClick={() => {
                    if (leaf) onToggleSelect(cat);
                    else onToggleOpen(cat._id);
                }}
                style={{ paddingLeft: `${8 + level * 16}px` }}
                className={`flex items-center gap-2 pr-3 py-1.5 cursor-pointer transition-colors
                    ${
                        leaf
                            ? isSelected
                                ? "bg-primary/10 text-primary"
                                : "text-text_normal hover:bg-bg_secondary/60"
                            : "text-text_dark hover:bg-bg_secondary/40"
                    }`}
            >
                {/* Expand chevron (parents) or checkbox (leaves) */}
                {!leaf ? (
                    <span className="shrink-0 w-4 h-4 flex items-center justify-center rounded bg-primary/10 text-primary">
                        <svg
                            width="8"
                            height="8"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            className={`transition-transform duration-150 ${isOpen ? "rotate-90" : "rotate-0"}`}
                        >
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </span>
                ) : (
                    <span
                        className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition
                        ${isSelected ? "bg-primary border-primary" : "border-border"}`}
                    >
                        {isSelected && (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </span>
                )}

                {/* Name */}
                <span className={`flex-1 text-sm truncate ${leaf ? "font-medium" : "font-semibold"}`}>{cat.name}</span>

                {/* Primary / order badge */}
                {isSelected && (
                    // <span
                    //     className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0
                    //     ${selectionIndex === 0 ? "bg-primary text-text_light" : "bg-primary/10 text-primary/70"}`}
                    // >
                    //     {selectionIndex === 0 ? "Primary" : `#${selectionIndex + 1}`}
                    // </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 bg-primary/10 text-primary/70`}>
                        {`#${selectionIndex + 1}`}
                    </span>
                )}
            </div>

            {/* Children */}
            {!leaf && isOpen && (
                <div className="border-l border-border ml-4">
                    {cat.subCategories.map((sub) => (
                        <TreeNode
                            key={sub._id}
                            cat={sub}
                            level={level + 1}
                            selectedIds={selectedIds}
                            openIds={openIds}
                            onToggleOpen={onToggleOpen}
                            onToggleSelect={onToggleSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────

const ProductCategoryList: React.FC<CategoryListProps> = ({ selectedIds, onChange }) => {
    const { productCategories } = useAuth();
    const allLeaves = collectLeaves(productCategories);

    const [open, setOpen] = useState(false);
    const [openIds, setOpenIds] = useState<string[]>([]); // which parent nodes are expanded
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggleOpen = (id: string) => setOpenIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

    const handleToggleSelect = (cat: Category) => {
        const newIds = selectedIds.includes(cat._id) ? selectedIds.filter((id) => id !== cat._id) : [...selectedIds, cat._id];

        if (newIds.length === 0) {
            onChange(null, []);
            return;
        }
        const first = allLeaves.find((c) => c._id === newIds[0]);
        onChange(first ? { _id: first._id, name: first.name } : null, newIds);
    };

    const removeTag = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newIds = selectedIds.filter((sid) => sid !== id);
        if (newIds.length === 0) {
            onChange(null, []);
            return;
        }
        const first = allLeaves.find((c) => c._id === newIds[0]);
        onChange(first ? { _id: first._id, name: first.name } : null, newIds);
    };

    const clearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null, []);
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* ── Trigger ── */}
            <div
                onClick={() => setOpen((prev) => !prev)}
                className={`w-full min-h-10.5 px-3 py-2 rounded border bg-slate-100 cursor-pointer flex flex-wrap gap-1.5 items-center pr-16 transition
                    ${open ? "border-primary/40 ring-2 ring-primary/20" : "border-border hover:border-primary/30"}`}
            >
                {selectedIds.length === 0 ? (
                    <span className="text-sm text-text_normal/30 select-none">Select categories…</span>
                ) : (
                    selectedIds.map((id) => {
                        const cat = allLeaves.find((c) => c._id === id);
                        if (!cat) return null;
                        return (
                            <span
                                key={id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary text-text_light text-xs font-semibold"
                            >
                                {cat.name}
                                <button
                                    type="button"
                                    onClick={(e) => removeTag(id, e)}
                                    className="opacity-60 hover:opacity-100 hover:text-red-300 transition ml-0.5"
                                >
                                    <FaXmark size={9} />
                                </button>
                            </span>
                        );
                    })
                )}

                {/* Right controls */}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {selectedIds.length > 0 && (
                        <button
                            type="button"
                            onClick={clearAll}
                            className="text-text_normal/30 hover:text-red-400 transition p-0.5 rounded"
                            title="Clear all"
                        >
                            <FaXmark size={11} />
                        </button>
                    )}
                    <FaChevronDown
                        size={11}
                        className={`text-text_normal/40 transition-transform duration-200 pointer-events-none ${open ? "rotate-180" : ""}`}
                    />
                </span>
            </div>

            {/* ── Dropdown ── */}
            {open && (
                <div className="absolute z-50 mt-1.5 w-full bg-bg_main border border-border rounded-xl shadow-lg overflow-hidden">
                    {/* Selection count hint */}
                    {selectedIds.length > 0 && (
                        <div className="px-3 py-1.5 bg-primary/5 border-b border-border/60 flex items-center justify-between">
                            <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-wider">{selectedIds.length} selected</p>
                            <button
                                type="button"
                                onClick={clearAll}
                                className="text-[10px] text-red-400/70 hover:text-red-500 font-medium transition"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="flex items-center gap-3 px-3 py-1.5 border-b border-border/40 bg-bg_secondary/30">
                        <span className="flex items-center gap-1.5 text-[10px] text-text_normal/40">
                            <span className="w-4 h-4 flex items-center justify-center rounded bg-primary/10">
                                <svg
                                    width="6"
                                    height="6"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                >
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </span>
                            Expand
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] text-text_normal/40">
                            <span className="w-4 h-4 rounded border-2 border-border" />
                            Selectable
                        </span>
                    </div>

                    {/* Tree */}
                    <div className="max-h-52 overflow-y-auto custom-scrollbar py-1">
                        {productCategories.length === 0 ? (
                            <p className="px-3 py-3 text-sm text-text_normal/40 text-center">No categories found</p>
                        ) : (
                            productCategories.map((cat) => (
                                <TreeNode
                                    key={cat._id}
                                    cat={cat}
                                    level={0}
                                    selectedIds={selectedIds}
                                    openIds={openIds}
                                    onToggleOpen={toggleOpen}
                                    onToggleSelect={handleToggleSelect}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCategoryList;
