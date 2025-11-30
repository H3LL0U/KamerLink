import React, { useEffect } from "react";
import { defaultScheme } from "../../main";
import { type ColorScheme } from "../../main";
import Header from "../../components/page_components/Header/Header";
import { getUsers, type UserInfo } from "../../api/user";
import GenericReplacement from "./generic_replacement";

interface UserBannedProps {
    userInfo?: UserInfo | null;
    scheme?: ColorScheme;
    showHeader?: boolean;
}

function UserBanned({ userInfo, scheme = defaultScheme, showHeader = true }: UserBannedProps) {

    const [bannedByUserNickanme, setBannedByUserNickanme] = React.useState<string>("Onbekend");

    if (!userInfo) {
        return (
            <>
                <GenericReplacement showHeader={showHeader} scheme={scheme}>
                    <div
                        style={{
                            minHeight: "100vh",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: scheme.first,
                            color: scheme.fourth,
                            textAlign: "center",
                            padding: "2rem",
                        }}
                    >
                        <h1 style={{ marginBottom: "1rem", color: scheme.third }}>
                            Geen informatie beschikbaar
                        </h1>
                        <p style={{ maxWidth: "600px", lineHeight: 1.6 }}>
                            Er is geen informatie over de gebruiker beschikbaar om de
                            blokkering weer te geven.
                        </p>
                    </div>
                </GenericReplacement>
            </>
        );
    }

    const banUntil = userInfo.ban_status?.banned_until
        ? new Date(userInfo.ban_status.banned_until * 1000).toLocaleString()
        : "Onbekend";

    const reason = userInfo.ban_status?.description || "Geen reden opgegeven";
    const bannedBy = userInfo.ban_status?.banned_by || "Onbekend";

    useEffect(() => {
        const fetchUser = async () => {
            const res = await getUsers({ type: bannedBy, page: 0 });
            res.data.items[0]?.nickname || "Onbekend";
            setBannedByUserNickanme(res.data.items[0]?.nickname || "Onbekend");
        }
        fetchUser();
    }, []);
    return (
        <>
            <GenericReplacement showHeader={showHeader} scheme={scheme}>
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: scheme.first,
                        color: scheme.fourth,
                        textAlign: "center",
                        padding: "2rem",
                    }}
                >
                    <h1 style={{ marginBottom: "1rem", color: scheme.third }}>
                        Je account is geblokkeerd
                    </h1>

                    <p style={{ marginBottom: "1rem", maxWidth: "600px", lineHeight: 1.6 }}>
                        Gebruiker: <strong>{userInfo.nickname}</strong>
                    </p>

                    <p style={{ marginBottom: "1rem", maxWidth: "600px", lineHeight: 1.6 }}>
                        Verbannen tot: <strong>{banUntil}</strong>
                    </p>

                    <p style={{ marginBottom: "1rem", maxWidth: "600px", lineHeight: 1.6 }}>
                        Reden: <strong>{reason}</strong>
                    </p>

                    <p style={{ marginBottom: "2rem", maxWidth: "600px", lineHeight: 1.6 }}>
                        Verbannen door: <strong>{bannedByUserNickanme} (id: {bannedBy})</strong>
                    </p>

                    <p>
                        Neem contact op met een administrator als je vragen hebt over deze
                        blokkering.
                    </p>
                </div>
            </GenericReplacement>
        </>
    );
}

export default UserBanned;
