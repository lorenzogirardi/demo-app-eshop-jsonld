"use client";

import { useState } from "react";

export default function AdminTokenGate({ onSubmit }: { onSubmit: (token: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      className="mx-auto mt-12 flex max-w-md flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value.trim());
      }}
    >
      <h1 className="text-2xl font-bold">Admin access</h1>
      <p className="text-sm opacity-70">Enter the admin token (ADMIN_TOKEN). It is kept only for this browser tab.</p>
      <label htmlFor="admin-token" className="sr-only">
        Admin token
      </label>
      <input
        id="admin-token"
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="input input-bordered"
        autoComplete="off"
      />
      <button type="submit" className="btn btn-primary" disabled={!value.trim()}>
        Unlock
      </button>
    </form>
  );
}
