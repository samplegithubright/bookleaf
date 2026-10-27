"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthorPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/author/books");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full" />
    </div>
  );
}
