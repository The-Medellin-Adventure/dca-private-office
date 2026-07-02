"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Este arreglo es tu menú fijo. Los módulos que TÚ creas desde la app
// aparecen como tarjetas en el panel principal, no aquí; esto es solo
// la navegación estructural. Puedes editar nombres/iconos libremente.
const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/modulos", label: "Módulos", icon: "grid" },
  { href: "/modulos/nuevo", label: "Nuevo módulo", icon: "plus" },
];

function Icon({ name, className }) {
  const paths = {
    home: "M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9",
    grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
    plus: "M12 5v14M5 12h14",
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={paths[name] || paths.home} />
    </svg>
  );
}

export default function Sidebar({ ownerName, ownerRole }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-line bg-paper min-h-screen px-5 py-6">
      <div className="mb-8">
        <div className="font-serif text-3xl font-semibold text-ink tracking-wide">
          DCA
        </div>
        <div className="text-[10px] tracking-[0.2em] text-inkSoft mt-1">
          PRIVATE OFFICE
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-goldSoft/40 text-gold font-medium"
                  : "text-inkSoft hover:bg-cream"
              }`}
            >
              <Icon name={item.icon} className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="card p-4 mt-6">
        <div className="text-sm font-medium text-ink mb-1">Seguridad</div>
        <div className="flex items-center gap-2 text-xs text-inkSoft">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Sesión activa
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-line text-xs">
        <div className="font-medium text-ink">{ownerName}</div>
        <div className="text-inkSoft">{ownerRole}</div>
      </div>
    </aside>
  );
}
