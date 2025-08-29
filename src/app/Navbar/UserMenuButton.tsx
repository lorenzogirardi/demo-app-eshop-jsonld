"use client";

import { Session } from "next-auth";
import Image from "next/image";

interface UserMenuButtonProps {
  session: Session | null;
}

export default function UserMenuButton({ session }: UserMenuButtonProps) {
  // Always use a mock user with an avatar from the internet
  const mockUser = {
    name: "Demo User",
    image: "https://i.pravatar.cc/150?img=3"
  };

  return (
    <div className="dropdown dropdown-end">
      <label className="btn btn-ghost btn-circle" tabIndex={0}>
        <Image
          unoptimized
          src={mockUser.image}
          alt="profilePic"
          width={40}
          height={40}
          className="w-10 rounded-full"
        />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box menu-sm z-30 mt-3 w-52 bg-base-100 p-2 shadow"
      >
        <li>
          <button>Demo User (No Auth)</button>
        </li>
      </ul>
    </div>
  );
}
