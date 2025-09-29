import React, { useEffect, useState } from "react";

type StatusBulbStatus = "loading" | "success" | "error";

interface StatusBulbProps {
    endpoint: string;
}

const StatusBulb: React.FC<StatusBulbProps> = ({ endpoint }) => {
    const [status, setStatus] = useState<StatusBulbStatus>("loading");

    useEffect(() => {
        const fetchData = async () => {
            setStatus("loading");
            try {
                const response = await fetch(endpoint);
                if (response.ok) {
                    setStatus("success");
                } else {
                    setStatus("error");
                }
            } catch (error) {
                setStatus("error");
            }
        };

        fetchData();
    }, [endpoint]);

    const getColor = () => {
        switch (status) {
            case "loading":
                return "yellow";
            case "success":
                return "green";
            case "error":
                return "red";
            default:
                return "gray";
        }
    };

    return (
        <div
            style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: getColor(),
                boxShadow: `0 0 10px ${getColor()}`,
                transition: "background-color 0.3s, box-shadow 0.3s",
            }}
        />
    );
};

export default StatusBulb;