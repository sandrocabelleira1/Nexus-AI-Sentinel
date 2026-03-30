
"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * @fileOverview Redireciona o tráfego da antiga rota /landing para a nova raiz (/).
 */
export default function LandingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
