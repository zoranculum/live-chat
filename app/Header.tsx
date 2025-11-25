import Link from "next/link";
import ClientNav from "./ClientNav";

// A simple ShadCN Header component
export default function Header() {
  return (
    <header className="p-4 bg-gray-100 border-b border-gray-300 flex items-center justify-between">
      <Link href="/">
        <h1 className="text-2xl font-bold text-gray-800">Koments</h1>
      </Link>
      <ClientNav />
    </header>
  );
}
