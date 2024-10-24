"use client"
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main>
      <div className="d-flex flex-column justify-content-center align-items-center w-100" style={{height:'100vh',gap:5}}>
          <LoadingScreen/>
      </div>
      {router.replace("/homePage")}
    </main>
  );
}
