import Script from "next/script";
import Head from "next/head";
import MainHeader from "@/components/main-header/main-header";
import ChatWidget from "@/components/chat-widget";

export default function UsersLayout({ children }) {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://use.typekit.net/uzv7jan.css" />
      </Head>
      <Script
        id="gmaps"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places&loading=async&v=weekly`}
        strategy="afterInteractive"
      />
      <MainHeader />
      {children}
      <ChatWidget />
    </>
  );
}
