import React, { useState, useMemo, useEffect } from "react";
import type { UserInfo } from "../../../api/user";
import UserInfoCircle from "../UserInfoCircle/UserInfoCircle";
import { defaultScheme, type ColorScheme } from "../../../main";
import KamerlinkPoints from "../../../assets/KamerlinkLogo.png";

export type SortKey = "MostPoints" | "MostReceivedLikes" | "MostReceivedPoints";

type UserLeaderboardProps = {
    users: UserInfo[];
    title?: string;
    scheme?: ColorScheme;
    startCountFrom?: number
    changeSort?: (sortKey: SortKey) => void;
};

export default function UserLeaderboard({
    users,
    title = "Leaderboard",
    scheme = defaultScheme,
    startCountFrom = 1,
    changeSort
}: UserLeaderboardProps) {
    const [sortKey, setSortKey] = useState<SortKey>("MostPoints");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 600);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const setSort = (key: SortKey) => {
        setSortKey(key);
        if (changeSort) changeSort(key);
    };

    const arrow = "▼"; // always descending

    // Map SortKey to actual UserInfo field
    const getField = (key: SortKey) => {
        switch (key) {
            case "MostPoints": return "points";
            case "MostReceivedLikes": return "received_likes";
            case "MostReceivedPoints": return "received_points";
        }
    };

    const sorted = useMemo(() => {
        const field = getField(sortKey) as keyof UserInfo;
        return [...users].sort((a, b) => {
            const aVal = Number(a[field] ?? 0);
            const bVal = Number(b[field] ?? 0);
            return bVal - aVal; // always descending
        });
    }, [users, sortKey]);

    const container: React.CSSProperties = {
        backgroundColor: scheme.second,
        color: scheme.third,
        padding: "1rem",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        overflowX: isMobile ? "auto" : "visible"
    };

    const titleStyle: React.CSSProperties = {
        textAlign: "center",
        fontSize: "clamp(1.5rem, 2vw, 2.2rem)",
        marginBottom: "0.5rem"
    };

    const headerRow: React.CSSProperties = isMobile
        ? { display: "none" }
        : {
            display: "grid",
            gridTemplateColumns: "40px 60px minmax(100px, 1fr) repeat(3, minmax(60px, 1fr))",
            padding: "0.5rem 0.3rem",
            alignItems: "center",
            fontWeight: 700,
            color: scheme.third,
            opacity: 0.9,
            gap: "0.5rem"
        };

    const list: React.CSSProperties = {
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem"
    };

    const itemStyle: React.CSSProperties = { fontSize: "1.1rem", fontWeight: 600 };

    const sortButton = (key: SortKey): React.CSSProperties => ({
        backgroundColor: key === sortKey ? scheme.first : scheme.second,
        border: `2px solid ${scheme.third}`,
        color: scheme.third,
        borderRadius: "10px",
        padding: "0.25rem 0.4rem",
        textAlign: "center",
        fontSize: "0.85rem",
        alignItems: "center",
        cursor: "pointer",
        userSelect: "none",
        fontWeight: key === sortKey ? 700 : 500
    });

    return (
        <div style={container}>
            <h2 style={titleStyle}>{title}</h2>

            {/* Desktop header */}
            <div style={headerRow}>
                <div>#</div>
                <div></div>
                <div>Naam</div>
                <div style={sortButton("MostReceivedPoints")} onClick={() => setSort("MostReceivedPoints")}>
                    Ontv. punten {sortKey === "MostReceivedPoints" && arrow}
                </div>
                <div style={sortButton("MostReceivedLikes")} onClick={() => setSort("MostReceivedLikes")}>
                    Likes {sortKey === "MostReceivedLikes" && arrow}
                </div>
                <div style={sortButton("MostPoints")} onClick={() => setSort("MostPoints")}>
                    Punten {sortKey === "MostPoints" && arrow}
                </div>
            </div>

            {/* Mobile buttons */}
            {isMobile && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", width: "100%", justifyContent: "space-evenly" }}>
                    <div style={sortButton("MostReceivedPoints")} onClick={() => setSort("MostReceivedPoints")}>
                        Ontv. punten {sortKey === "MostReceivedPoints" && arrow}
                    </div>

                    <div style={sortButton("MostReceivedLikes")} onClick={() => setSort("MostReceivedLikes")}>
                        Likes {sortKey === "MostReceivedLikes" && arrow}
                    </div>
                    <div style={sortButton("MostPoints")} onClick={() => setSort("MostPoints")}>
                        Punten {sortKey === "MostPoints" && arrow}
                    </div>

                </div>
            )}

            <ul style={list}>
                {sorted.map((u, i) => {
                    if (isMobile) {
                        return (
                            <li key={u._id.$oid} style={{
                                display: "flex",
                                flexDirection: "column",
                                backgroundColor: scheme.first,
                                borderRadius: "12px",
                                padding: "0.75rem",
                                gap: "0.5rem"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <div style={{ fontWeight: 700 }}>{i + 1 + startCountFrom}</div>
                                    <UserInfoCircle userInfo={u} style={{ width: "55px", height: "55px" }} behavior="redirectToUserPage" />
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{u.nickname}</div>
                                        <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
                                            {u.role === "Teacher" ? "Docent" : u.role}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", fontWeight: 600, color: scheme.third }}>
                                    <div style={itemStyle}>{u.received_points ?? 0} Ontv. Ptn</div>
                                    <div style={itemStyle}>{u.received_likes ?? 0} Likes</div>
                                    <div style={itemStyle}>{u.points ?? 0} Punten</div>


                                </div>
                            </li>
                        );
                    }

                    return (
                        <li key={u._id.$oid} style={{
                            display: "grid",

                            gridTemplateColumns: "minmax(40px, 70px) 60px minmax(100px, 1fr) repeat(3, minmax(60px, 1fr))",
                            alignItems: "center",
                            padding: "0.75rem 1rem",
                            backgroundColor: scheme.first,
                            borderRadius: "12px",
                            color: scheme.third
                        }}>

                            <div style={{
                                fontWeight: 700,
                                textAlign: "right",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                paddingRight: "0.5rem"
                            }}>
                                {i + startCountFrom + 1}
                            </div>

                            <UserInfoCircle userInfo={u} style={{ width: "55px", height: "55px" }} behavior="redirectToUserPage" />

                            <div>
                                <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{u.nickname}</div>
                                <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
                                    {u.role === "Teacher" ? "Docent" : u.role}
                                </div>
                            </div>

                            <div style={{ textAlign: "center", fontWeight: 600 }}>{u.received_points ?? 0}</div>
                            <div style={{ textAlign: "center", fontWeight: 600 }}>{u.received_likes ?? 0}</div>

                            <div style={{ textAlign: "center", fontWeight: 600 }}>{u.points ?? 0}</div>
                        </li>

                    );
                })}
            </ul>
        </div>
    );
}
