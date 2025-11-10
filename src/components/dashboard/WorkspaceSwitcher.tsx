"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

import type { WorkspaceSummary } from "./WorkspaceSidebar";

type WorkspaceSwitcherProps = {
  workspaces: WorkspaceSummary[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (name: string) => void;
  onDeleteWorkspace: (id: string) => void;
  onClose: () => void;
};

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onDeleteWorkspace,
  onClose,
}: WorkspaceSwitcherProps) {
  const [search, setSearch] = useState("");
  const activeWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? null,
    [workspaces, activeWorkspaceId],
  );
  const filtered = useMemo(
    () =>
      workspaces.filter(
        (workspace) =>
          workspace.name.toLowerCase().includes(search.toLowerCase()) ||
          workspace.owner.toLowerCase().includes(search.toLowerCase()),
      ),
    [workspaces, search],
  );

  const handleCreate = async () => {
    const name = prompt("Workspace name");
    if (name && name.trim().length > 0) {
      await onCreateWorkspace(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 px-4 pt-24" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-[#DDE4F2] bg-white p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        {activeWorkspace ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#111827]">{activeWorkspace.name}</p>
              <p className="text-xs text-[#6B7280]">{activeWorkspace.owner}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-[#E4EBF5] px-3 py-1.5 text-xs font-semibold text-[#111827] hover:border-[#2563EB]">
                Workspace Settings
              </button>
              <button className="rounded-lg border border-[#E4EBF5] px-3 py-1.5 text-xs font-semibold text-[#111827] hover:border-[#2563EB]">
                Invite
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          <label className="flex items-center rounded-lg border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#6B7280]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              className="w-full border-none bg-transparent outline-none"
            />
          </label>
        </div>

        <div className="mt-4 max-h-64 overflow-y-auto">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9CA3AF]">Armor Workspace</p>
          <div className="space-y-2">
            {filtered.map((workspace) => (
              <div
                key={workspace.id}
                className={clsx(
                  "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition",
                  activeWorkspaceId === workspace.id ? "border-[#2563EB] bg-[#EDF2FF]" : "border-[#E4EBF5] hover:border-[#2563EB]",
                )}
              >
                <button
                  onClick={() => onSelectWorkspace(workspace.id)}
                  className="flex flex-1 items-center justify-between gap-3 text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#EDF2FF] text-[#2563EB]">
                      <LogoMark />
                    </span>
                    {workspace.name}
                  </span>
                  <span className="text-xs text-[#6B7280]">{workspace.shops.length} stores</span>
                </button>
                {workspaces.length > 1 ? (
                  <button
                    onClick={async () => {
                      const confirmed = window.confirm(
                        `Remove “${workspace.name}”? Pages saved under this workspace will remain stored.`,
                      );
                      if (!confirmed) return;
                      await onDeleteWorkspace(workspace.id);
                    }}
                    className="ml-2 rounded-md border border-transparent px-2 py-1 text-xs text-[#9CA3AF] hover:border-[#F87171] hover:text-[#B91C1C]"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
        >
          + New Workspace
        </button>
      </div>
    </div>
  );
}

const LogoMark = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="20" rx="6" fill="currentColor" opacity="0.12" />
    <path
      d="M11.7734 5.125L10.1914 11.5859L8.18945 5.125H6.34766L9.19141 14.8281H11.041L12.7383 8.74219L14.418 14.8281H16.2734L19.1133 5.125H17.3125L15.292 11.5859L13.7109 5.125H11.7734Z"
      fill="currentColor"
    />
  </svg>
);


