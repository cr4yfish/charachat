// import { getChats } from "@/functions/db/chatList";
// import ChatCardSmall from "../chat/ChatCardSmall";
// import InfiniteListLoader from "../InfiniteListLoader";
// import ChatCardSmallSkeleton from "../chat/ChatCardSmallSkeleton";
// import useSWR from 'swr'

// export default function SidebarChatListLoader() {

//     const { data: chats } = useSWR("chats", () => getChats({ cursor: 0, limit: 15 }), {
//         revalidateOnFocus: false,
//         revalidateIfStale: false,
//         revalidateOnReconnect: false,
//     });

//     return (
//         <InfiniteListLoader 
//             initialData={chats}
//             loadMore={getChats}
//             limit={15}
//             component={ChatCardSmall}
//             componentProps={{hasLink: true}}
//             skeleton={<ChatCardSmallSkeleton />}
//         />
//     )
// }