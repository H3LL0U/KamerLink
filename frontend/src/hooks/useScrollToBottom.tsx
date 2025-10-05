import { useEffect, useRef } from "react";

/**
 * Triggers the callback when the user scrolls near the bottom of the page.
 * Ensures it won't retrigger while a fetch is already running.
 */
export function useScrollToBottom(callback: () => Promise<void> | void, offset = 200) {
    const isFetching = useRef(false);

    useEffect(() => {

        const handleScroll = () => {

            if (isFetching.current) return;

            const scrollY = window.scrollY || window.pageYOffset;
            const visible = window.innerHeight;
            const pageHeight = document.documentElement.scrollHeight;

            if (scrollY + visible + offset >= pageHeight) {

                isFetching.current = true;

                Promise.resolve(callback()).finally(() => {
                    setTimeout(() => {
                        isFetching.current = false;
                    }, 400);
                });
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [callback, offset]);
}
