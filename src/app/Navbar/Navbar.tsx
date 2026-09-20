import logo from "@/assets/logo.png";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCart } from "@/lib/db/cart";
import ShoppingCartButton from "./ShoppingCartButton";
import UserMenuButton from "./UserMenuButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { isAIEnabled } from "@/lib/ai/config";

async function searchProducts(formData: FormData) {
  "use server";

  const searchQuery = formData.get("searchQuery")?.toString();
  const useAI = formData.get("useAI") === "on";
  if (searchQuery) {
    if (useAI) {
      redirect("/search?query=" + encodeURIComponent(searchQuery) + "&ai=true");
    } else {
      redirect("/search?query=" + encodeURIComponent(searchQuery));
    }
  }
}

export default async function Navbar() {
  const session = await getServerSession(authOptions);
  const cart = await getCart();
  const aiEnabled = isAIEnabled();

  return (
    <div className="bg-base-100">
      <div className="navbar max-w-7xl m-auto flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Link href="/" className="text-xl normal-case">
            <Image
              unoptimized
              src={logo}
              height={100}
              width={150}
              alt="Gucci - Platform Engineering"
            />
          </Link>
          Platform Engineering - Demo Application
        </div>
        <div className="flex-none gap-2">
          <form action={searchProducts} role="search">
            <div className="form-control">
              <div className="join">
                <input
                  name="searchQuery"
                  aria-label="Search products"
                  placeholder="Search products..."
                  className="input input-bordered join-item w-full min-w-[200px]"
                />
                {aiEnabled && (
                  <label className="label cursor-pointer join-item gap-1 px-2 border border-base-300 bg-base-200">
                    <input
                      type="checkbox"
                      name="useAI"
                      aria-label="Use AI search"
                      className="checkbox checkbox-sm checkbox-primary"
                      defaultChecked={false}
                    />
                    <span className="label-text text-xs">AI</span>
                  </label>
                )}
                <button type="submit" className="btn btn-primary join-item">
                  Search
                </button>
              </div>
            </div>
          </form>
          <ShoppingCartButton cart={cart} />
          <UserMenuButton session={session} />
        </div>
      </div>
    </div>
  );
}
