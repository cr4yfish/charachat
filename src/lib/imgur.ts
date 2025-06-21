import { ImgurClient } from "imgur"

export async function uploadImageToImgur(base64: string): Promise<string> {
    const imgur = new ImgurClient({ 
        clientId: process.env.IMGUR_CLIENT_ID,
        clientSecret: process.env.IMGUR_CLIENT_SECRET
    });

    const imgurResponse = await imgur.upload({
        image: base64,
        type: "base64"
    }).catch((e) => {
        throw new Error(e);
    });

    console.log("Imgur upload response:", imgurResponse);

    return imgurResponse.data.link
}


export async function uploadLinkToImgur(link: string): Promise<string> {
    const imgur = new ImgurClient({
        clientId: process.env.IMGUR_CLIENT_ID,
        clientSecret: process.env.IMGUR_CLIENT_SECRET
    });

    const imgurResponse = await imgur.upload({
        image: link,
        type: "url"
    }).catch((e) => {
        throw new Error(e);
    });

    if(imgurResponse?.data?.link && imgurResponse.data.link.length > 3) {
        return imgurResponse.data.link
    } else {
        console.error("Error generating Imgur link");
        return link;
    }
}