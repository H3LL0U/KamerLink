import React, { useState } from "react";
import Popup from "../../generic_components/PopUp/PopUp";
import { banUser, type UserInfo } from "../../../api/user";

interface BanUserPopUpProps {
    userInfo: UserInfo;
    onClose: () => void;
    // Optional: if not provided, will use banUser API directly
    onConfirm?: (userId: string, banUntil: number, description: string) => void;
}

const BanUserPopUp: React.FC<BanUserPopUpProps> = ({
    userInfo,
    onClose,
    onConfirm,
}) => {
    const [banDateTime, setBanDateTime] = useState<string>("");
    const [reason, setReason] = useState<string>("");


    const handleConfirm = () => {
        if (!banDateTime) {
            alert("Selecteer een datum een tijd voor de verbanning");
            return;
        }
        if (!reason.trim()) {
            alert("Selecteer een reden voor een verbanning");
            return;
        }

        // Convert datetime-local string to UTC timestamp in seconds
        const localDate = new Date(banDateTime);
        const timestampSecondsUTC = Math.floor(
            Date.UTC(
                localDate.getFullYear(),
                localDate.getMonth(),
                localDate.getDate(),
                localDate.getHours(),
                localDate.getMinutes()
            ) / 1000
        );

        if (onConfirm) {
            onConfirm(userInfo._id.$oid, timestampSecondsUTC, reason);
        } else {

            banUser({
                ban_user_id: userInfo._id.$oid,
                banned_until: timestampSecondsUTC,
                description: reason,
            });
        }

        onClose();
    };

    return (
        <Popup onClose={onClose}>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                <p>
                    Ben je zeker dat je <strong>{userInfo.nickname}</strong> wilt verbannen?
                </p>

                <label>
                    Verbannen tot:
                    <input
                        type="datetime-local"
                        value={banDateTime}
                        onChange={(e) => setBanDateTime(e.target.value)}
                        style={{ marginLeft: 10 }}
                    />
                </label>

                <label>
                    Reden voor verbanning:
                    <textarea
                        placeholder="Bericht"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        rows={5}
                        maxLength={1000}
                        style={{
                            width: "100%",
                            height: "25vh",
                            marginBottom: 8,
                            padding: "12px 14px",
                            color: "black",
                            borderRadius: 8,
                            border: "1px solid #d1d5db",
                            fontSize: "1.1rem",
                            background: "#f9fafb",
                            fontWeight: 400,
                            resize: "vertical",
                        }}
                    />
                </label>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={onClose}>Annuleren</button>
                    <button
                        onClick={handleConfirm}
                        style={{ backgroundColor: "red", color: "white" }}
                    >
                        Bevestigen
                    </button>
                </div>
            </div>
        </Popup>
    );
};

export default BanUserPopUp;
