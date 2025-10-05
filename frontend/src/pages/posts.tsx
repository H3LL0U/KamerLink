import React, { useEffect, useState, useCallback } from "react";
import { type Posts, type RetrievePost, retrievePosts } from "../api/post";
import Header from "../components/page_components/Header/Header";
import PostCard from "../components/page_components/PostCard/PostCard";
import Dropdown from "../components/generic_components/Dropdowns/Dropdown";
import MultiDropdown from "../components/generic_components/Dropdowns/MultiDropdown";
import { defaultScheme } from "../main";
import ColorTransition from "../components/generic_components/ColorTransition/ColorTransition";
import OptionBar from "../components/generic_components/OptionBar/OptionBar";
import { useAuthenticatedUser } from "../hooks/useAuthenticatedUser";
import InvalidEmail from "./REPLACEMENTS/invalid_email";
import { useScrollToBottom } from "../hooks/useScrollToBottom";
import PostViewBase from "../components/page_components/PostViewBase/PostViewBase";

type Filter = "Nieuw" | "Likes" | "Points";
type Tags = "Nieuws" | "Grappig" | "Idee" | "Alle";

function PostViewPage() {
  return <PostViewBase showHeader={true} />
}

export default PostViewPage;
