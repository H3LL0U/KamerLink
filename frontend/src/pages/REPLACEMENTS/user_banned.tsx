import React from "react";
import { defaultScheme } from "../../main";
import { type ColorScheme } from "../../main";
import Header from "../../components/page_components/Header/Header";
import { type UserInfo } from "../../api/user";

interface UserBannedProps {
    userInfo?: UserInfo | null;
    scheme?: ColorScheme;
}

function UserBanned({ userInfo, scheme = defaultScheme }: UserBannedProps) {
    if (!userInfo) {
        return (
            <>
                <Header />
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
            </>
        );
    }

    const banUntil = userInfo.ban_status?.banned_until
        ? new Date(userInfo.ban_status.banned_until * 1000).toLocaleString()
        : "Onbekend";

    const reason = userInfo.ban_status?.description || "Geen reden opgegeven";
    const bannedBy = userInfo.ban_status?.banned_by || "Onbekend";

    return (
        <>
            <Header />
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
                    Verbannen door: <strong>{bannedBy}</strong>
                </p>

                <p>
                    Neem contact op met een administrator als je vragen hebt over deze
                    blokkering.
                </p>
            </div>
        </>
    );
}

export default UserBanned;
