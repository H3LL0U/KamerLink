import React from "react";
import styles from "./WithSmoothAppearance.module.css";

const WithSmoothAppearance: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles["smooth-appearance"]} ${visible ? styles.visible : ""}`}
    >
      {children}
    </div>
  );
};

export default WithSmoothAppearance;
