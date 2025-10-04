import { useEffect } from "react";

/**
 * Triggers the callback when the user scrolls to the bottom of the page.
 * @param callback Function to call when bottom is reached
 * @param offset Optional offset in pixels before reaching the bottom
 */
export function useScrollToBottom(callback: () => void, offset = 0) {
    useEffect(() => {
        function handleScroll() {
            const scrollY = window.scrollY || window.pageYOffset;
            const visible = window.innerHeight;
            const pageHeight = document.documentElement.scrollHeight;
            if (scrollY + visible + offset >= pageHeight) {
                callback();
            }
        }
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [callback, offset]);
}
