"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() =>
        signOut({
          callbackUrl: "/",
        })
      }
      className="text-xs font-bold text-zinc-400 hover:text-orange-500"
    >
      SIGN OUT
    </button>
  );
}