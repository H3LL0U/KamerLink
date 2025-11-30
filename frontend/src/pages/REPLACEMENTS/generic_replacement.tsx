import React from "react";
import { defaultScheme } from "../../main";
import { type ColorScheme } from "../../main";
import Header from "../../components/page_components/Header/Header";

export interface GenericReplacementProps {
    scheme?: ColorScheme;
    showHeader?: boolean;
    children?: React.ReactNode;
}

function GenericReplacement({ scheme = defaultScheme, showHeader = true, children }: GenericReplacementProps) {
    return (
        <>
            {showHeader && <Header />}

            {children}
        </>
    );
}

export default GenericReplacement;