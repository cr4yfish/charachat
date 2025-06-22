import { cookies } from "next/headers";

const getKeyServerSide = async (): Promise<string> => {
    const cookiesStore = await cookies();
    const key = cookiesStore.get('key')?.value;

    if(!key) {
        throw new Error("Key not found in cookies");
    }

    return key;
}

const removeKeyCookie = async () => {
    (await cookies()).set("key", "", { secure: true, sameSite: "strict", priority: "high", maxAge: 0 });
}

export {
    getKeyServerSide as getKeyServerSideLegacy,
    removeKeyCookie as removeKeyCookieLegacy,
}