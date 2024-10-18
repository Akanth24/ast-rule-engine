"use client"
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main>
      <div className="d-flex flex-column justify-content-center align-items-center w-100" style={{height:'100vh',gap:5}}>
          <div className="spinner-border text-primary" role="status" />
          <div style={{fontSize:'16px'}}>Loading Home Page.......</div>
      </div>
      {router.replace("/homePage")}
    </main>
  );
}
