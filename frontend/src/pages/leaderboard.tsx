import Header from "../components/page_components/Header/Header";
import { useAuthenticatedUser } from "../hooks/useAuthenticatedUser";
import UserLeaderboard, { type SortKey } from "../components/page_components/UserLeaderboard/UserLeaderboard";
import { useState, useEffect } from "react";
import { getUsers, type UserInfo } from "../api/user";
import { defaultScheme } from "../main";
import { useSearchParams } from "react-router-dom";

function Leaderboard() {
    const { AuthReplacement } = useAuthenticatedUser();
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [isLastPage, setIsLastPage] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get("page") ?? 0);
    const sortKeyParam = searchParams.get("sort") as SortKey | null;
    const sortKey: SortKey = sortKeyParam ?? "MostPoints";

    const PAGE_SIZE = 10;

    const fetchUsers = async (key: SortKey, pageNumber: number) => {
        const res = await getUsers({ type: key, page: pageNumber });
        if (res?.data?.items) {
            setUsers(res.data.items);
            setIsLastPage(res.data.items.length < PAGE_SIZE);
        } else {
            setUsers([]);
            setIsLastPage(true);
        }
    };


    useEffect(() => {
        fetchUsers(sortKey, page);
    }, [sortKey, page]);

    const onChangeSort = (key: SortKey) => {

        setSearchParams({ sort: key, page: "0" });
        fetchUsers(key, 0);
    };

    const goToPage = (newPage: number) => {
        setSearchParams({ sort: sortKey, page: String(newPage) });
    };

    if (AuthReplacement) return AuthReplacement;

    return (
        <>
            <Header />
            <div style={{ margin: "auto", maxWidth: "900px", paddingBottom: "1rem", marginTop: "1rem" }}>
                <UserLeaderboard
                    users={users}
                    changeSort={onChangeSort}
                    startCountFrom={page * PAGE_SIZE}
                />

                {/* Page selector */}
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem", }}>
                    <button
                        onClick={() => goToPage(Math.max(page - 1, 0))}
                        disabled={page === 0}
                        style={{ padding: "0.5rem 1rem", cursor: page === 0 ? "not-allowed" : "pointer", backgroundColor: defaultScheme.second }}
                    >
                        Vorige
                    </button>
                    <span style={{ alignSelf: "center" }}>Page {page + 1}</span>
                    <button
                        onClick={() => goToPage(page + 1)}
                        disabled={isLastPage}
                        style={{ padding: "0.5rem 1rem", cursor: isLastPage ? "not-allowed" : "pointer", backgroundColor: defaultScheme.second }}
                    >
                        Volgende
                    </button>
                </div>
            </div>
        </>
    );
}

export default Leaderboard;
