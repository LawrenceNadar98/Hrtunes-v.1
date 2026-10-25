import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
    { label: "Courses", href: "/#courses" },
    { label: "Instructors", href: "/#instructors" },
    { label: "Pricing", href: "/plans" },
    { label: "Gallery", href: "/#gallery" },
    { label: "Contact", href: "/#contact" },
];

export default function SiteHeader() {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (!location.hash) return undefined;

        const frameId = window.requestAnimationFrame(() => {
            const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
            target?.scrollIntoView({ behavior: "smooth", block: "start" });
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [location.pathname, location.hash]);

    const handleNavClick = (event, href) => {
        setOpen(false);

        const target = new URL(href, window.location.origin);
        if (location.pathname === target.pathname && location.hash === target.hash) {
            event.preventDefault();
            document.getElementById(decodeURIComponent(target.hash.slice(1)))?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    return (
        <header
            className="sticky top-0 z-50 backdrop-blur-2xl bg-background/60 border-b border-white/10"
            data-testid="site-header"
        >
            <div className="container-hr flex items-center justify-between h-16">
                <Link to="/" className="flex items-center gap-2 group" data-testid="site-logo">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white font-black text-sm group-hover:rotate-12 transition-transform">
                        HR
                    </span>
                    <span className="text-heading font-bold text-lg tracking-tight">
                        HR Tunes
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {NAV.map((n) => (
                        <Link
                            key={n.label}
                            to={n.href}
                            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                            data-testid={`nav-${n.label.toLowerCase()}`}
                            onClick={(event) => handleNavClick(event, n.href)}
                        >
                            {n.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    <Link to="/plans" className="btn-primary !py-2 !px-4 text-xs" data-testid="header-trial-btn">
                        View Course Plans
                    </Link>
                </div>

                <button
                    className="md:hidden text-white"
                    onClick={() => setOpen(!open)}
                    aria-label="Menu"
                    data-testid="mobile-menu-btn"
                >
                    {open ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {open && (
                <div className="md:hidden border-t border-white/10 bg-background">
                    <div className="container-hr py-4 flex flex-col gap-4">
                        {NAV.map((n) => (
                            <Link
                                key={n.label}
                                to={n.href}
                                className="text-sm font-medium text-muted-foreground hover:text-white"
                                onClick={(event) => handleNavClick(event, n.href)}
                            >
                                {n.label}
                            </Link>
                        ))}
                        <div className="divider-dashed" />
                        <Link to="/plans" className="btn-primary" onClick={() => setOpen(false)}>
                            View Course Plans
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
