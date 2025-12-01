// src/components/PostCard/PostActionMenu.tsx
import React from "react";
import ActionMenuButton from "./ActionMenuButton";
import { isHigherRole } from "../../../../api/user";
import type { ColorScheme } from "../../../../main";
import type { UserInfo } from "../../../../api/user";
import type { Posts } from "../../../../api/post";
import { defaultScheme } from "../../../../main";
interface PostActionMenuProps {
    scheme?: ColorScheme;
    userInfo: UserInfo;
    authorInfo: UserInfo;
    canEditOrDelete: boolean;

    onEdit?: (() => void) | null;
    onDelete?: (() => void) | null;
    onBan?: (() => void) | null;
}

export default function PostActionMenu({
    scheme = defaultScheme,
    userInfo,
    authorInfo,
    canEditOrDelete,
    onEdit = null,
    onDelete = null,
    onBan = null
}: PostActionMenuProps) {
    const actions = [];
    // check if should appear



    // Edit/Delete options
    if (canEditOrDelete) {
        if (onEdit) actions.push({ label: "Bewerken", onClick: onEdit });
        if (onDelete) actions.push({ label: "Verwijderen", onClick: onDelete });
    }

    // Ban option (only if user's role is higher)

    if (isHigherRole(userInfo.role, authorInfo.role) && onBan) {
        actions.push({
            label: "Verbannen",
            onClick: onBan,
        });
    }

    if (actions.length === 0) return null;

    return (
        <ActionMenuButton
            scheme={scheme}
            actions={actions}
        />
    );
}