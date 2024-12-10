"use client";

import { Button } from "./utils/Button";
import Icon from "./utils/Icon";
import { useTheme } from "next-themes";

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();


    return (
        <>
        <Button variant="light" radius="full" isIconOnly onClick={() => setTheme(theme == "light" ? "dark" : "light")}>
            <Icon>{theme == "light" ? "dark_mode" : "light_mode"}</Icon>
        </Button>
        </>
    )
}