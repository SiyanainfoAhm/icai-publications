import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-[var(--icai-navy)]">Administration</h1>
      <p className="mt-2 text-slate-600">
        Manage publications, review OTP and access audit trails, and monitor users.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { href: "/admin/publications/new", title: "Upload publication", desc: "Add new catalogue item" },
          { href: "/admin/publications", title: "Publication list", desc: "Publish, hide, or archive" },
          { href: "/admin/users", title: "User list", desc: "Members and non-members" },
          { href: "/admin/logs/otp", title: "OTP audit log", desc: "Verification attempts" },
          { href: "/admin/logs/access", title: "Access log", desc: "Publication reads" },
        ].map((item) => (
          <li key={item.href} className="icai-card rounded-lg p-5">
            <Link href={item.href} className="font-semibold text-[var(--icai-navy)] hover:underline">
              {item.title}
            </Link>
            <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
