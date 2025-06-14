import Link from "next/link";
import Logo from "./Logo";
import NavbarButtons from "./NavbarButtons";
import ThemeSwitcher from "./ThemeSwitcher";

export default function NavbarServerWrapper() {

    return (
        <>
        <div className="absolute top-0 left-0 w-full flex flex-row items-center justify-between px-4 pt-3 pb-2 backdrop-blur z-50">
            <div className="flex items-center gap-2">
                <Link href={"/"}><Logo hideTextOnMobile /></Link>
            </div>

            <div className="flex items-center gap-2">
                <NavbarButtons />
                <ThemeSwitcher />
            </div>
        </div>
        
        </>
    )
}