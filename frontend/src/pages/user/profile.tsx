import React, { useEffect, useState } from "react";
import Header from "../../components/page_components/Header/Header";
import UserHeader from "../../components/page_components/UserHeader/UserHeader";
import Card from "../../components/generic_components/Card/Card";
import ColorTransition from "../../components/generic_components/ColorTransition/ColorTransition";
import { defaultScheme } from "../../main";
import UserInfoCircle from "../../components/page_components/UserInfoCircle/UserInfoCircle";
import { getUsers } from "../../api/user";
import { useLocation } from "react-router-dom";
import PostViewBase from "../../components/page_components/PostViewBase/PostViewBase";
import { retrieveUserPosts } from "../../api/user";
import type { Posts, RetrievePost } from "../../api/post";
import { useAuthenticatedUser } from "../../hooks/useAuthenticatedUser";
import type { components } from "../../api/gen/api";

type UserInfo = components["schemas"]["UserInfo"];

function buildUserPostFetcher(userInfo: UserInfo) {
  return async (request: RetrievePost): Promise<{ data: Posts }> => {
    const { page, type } = request;
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("type") ?? userInfo._id.$oid;
    if (!userId) throw new Error("User ID not found");

    const data = await retrieveUserPosts({
      user_id: userId,
      page,
      type,
    });

    return data;
  };
}

const Profile = () => {
  const { user, isAuthenticated, AuthReplacement, userInfo } =
    useAuthenticatedUser();
  const [overrideUserInfo, setOverrideUserInfo] = useState<UserInfo | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!userInfo) return;

    const params = new URLSearchParams(location.search);
    const type = params.get("type");

    const fetchUser = async () => {
      if (type) {
        const user = await getUsers({ type, page: 0 });
        setOverrideUserInfo(user.data.items[0]);
      } else {
        setOverrideUserInfo(null);
      }
    };
    fetchUser();
  }, [location.search, userInfo]);

  if (AuthReplacement) return AuthReplacement;

  const displayUserInfo = overrideUserInfo || userInfo;
  if (!isAuthenticated || !displayUserInfo) return null;

  return (
    <>
      <Header />
      <UserHeader
        name={displayUserInfo.nickname ?? "Aan het laden"}
        userInfo={displayUserInfo}
        img_src={
          <div style={{ display: "inline-block", cursor: "pointer" }}>
            <UserInfoCircle userInfo={displayUserInfo} />
          </div>
        }
      >

      </UserHeader>
      <ColorTransition
        from={defaultScheme.second}
        to={defaultScheme.first}
        height="5px"
      />

      <PostViewBase fetchFunction={buildUserPostFetcher(displayUserInfo)} />
    </>
  );
};

export default Profile;
