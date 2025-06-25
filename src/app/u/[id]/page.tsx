import { Metadata } from "next";
import { getPublicProfile } from "@/lib/db/profile";
import Image from "next/image";
import { safeParseLink } from "@/lib/utils/text";
import { Markdown } from "@/components/ui/markdown";
import { getPublicUserCharacters } from "@/lib/db/character";
import InfiniteSwiperLoader from "@/components/swiper/infinite-swiper-loader";
import { LIMITS } from "@/lib/constants/limits";
import ImageCharacterCard from "@/components/character/character-card-image";
import UserTopHeader from "@/components/user/user-top-bar";
import { API_ROUTES } from "@/lib/constants/apiRoutes";

type Params = Promise<{ id: string }>

export async function generateMetadata(
    { params } : { params: Params }
) : Promise<Metadata> {
    
    try {
        const { id } = await params;
        const profile = await getPublicProfile(id);

        return {
            title: `${profile.username}`,
        }
        
    } catch (error) {
        console.error(error);
        return {
            title: `Viewing User`,
        }   
    }
}

export default async function CharacterView({ params }: { params: Params }) {

    const { id } = await params;

    const profile = await getPublicProfile(id);
    const chars = await getPublicUserCharacters({
        cursor: 0,
        limit: 31,
        args: {
            userId: id
        }
    })

    return (
        <>
        <div className="relative w-full h-full min-h-full">

            <UserTopHeader profile={profile} />

            <div className="absolute top-0 left-0 size-full z-[1] bg-gradient-to-tr from-background/90 to-background backdrop-blur-lg"></div>
            <div className="absolute top-0 left-0 size-full overflow-hidden">
                <Image 
                    fill alt=""
                    className="object-cover object-center"
                    src={safeParseLink(profile.avatar_link)}
                />

            </div>
            <div className="flex flex-col items-center gap-4 pb-20 px-6 py-6 relative h-full overflow-x-hidden pt-[75px] z-10">
                <div className="overflow-hidden relative size-16 rounded-full shrink-0">
                    <Image 
                        fill alt=""
                        className="object-cover object-center"
                        src={safeParseLink(profile.avatar_link)}
                    />
                </div>
                <span>{profile.username}</span>
                <Markdown>{profile.public_bio}</Markdown>

                <span>Public Chars</span>
                <InfiniteSwiperLoader 
                    apiUrl={API_ROUTES.GET_CHARACTERS_BY_USER + profile.user}
                    limit={LIMITS.MAX_CHARACTERS_PER_PAGE}
                    rows={1}
                    component={ImageCharacterCard}
                    componentProps={{
                        hasLink: true,
                    }}
                    initialData={chars || []}
                />
            </div>
        </div>
        
        </>
    )

}