import Link from 'next/link';

function SocialIcon({ label, href, children }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-purple-600 transition-all duration-300"
        >
            {children}
        </a>
    );
}

function Footer() {
    return (
        <footer className="w-full border-t border-white/10 bg-black pt-16 pb-8">
            <div className="container">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand + Social */}
                    <div className="col-span-2 md:col-span-1 text-center md:text-left max-w-xl mx-auto md:mx-0 space-y-4">
                        <div>
                            <Link href="/" className="text-2xl font-bold text-white tracking-tighter mb-4 block">
                                MEBSY<span className="text-purple-500"> STORE</span>
                            </Link>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Explora hardware y accesorios pensados para realzar tu experiencia gaming.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-3">Redes Sociales</h3>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                <SocialIcon label="Facebook" href="https://facebook.com">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M22 12a10 10 0 10-11.563 9.874v-6.987H7.898V12h2.539V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.196 2.238.196v2.461h-1.261c-1.243 0-1.63.771-1.63 1.563V12h2.773l-.443 2.887h-2.33v6.987A10.003 10.003 0 0022 12z" />
                                    </svg>
                                </SocialIcon>

                                <SocialIcon label="Instagram" href="https://instagram.com">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M7 2C4.239 2 2 4.239 2 7v10c0 2.761 2.239 5 5 5h10c2.761 0 5-2.239 5-5V7c0-2.761-2.239-5-5-5H7zm10 2a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h10zm-5 3.5A4.5 4.5 0 1016.5 12 4.505 4.505 0 0012 7.5zm0 2A2.5 2.5 0 1110.5 12 2.503 2.503 0 0112 9.5zM17.75 6a.75.75 0 10.75.75.75.75 0 00-.75-.75z" />
                                    </svg>
                                </SocialIcon>

                                <SocialIcon label="X" href="https://x.com">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M18.9 2H22l-6.8 7.78L23.2 22h-6.6l-5.2-6.7L5.9 22H2.8l7.3-8.35L1 2h6.8l4.7 6.1L18.9 2zm-1.2 18h1.7L7.9 3.9H6.1L17.7 20z" />
                                    </svg>
                                </SocialIcon>
                            </div>
                        </div>
                    </div>

                    {/* Links - Productos */}
                    <div className="col-span-1 text-center md:text-left">
                        <h3 className="text-white font-semibold mb-4">Productos</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/categoria/monitores" className="hover:text-purple-400 transition-colors">Monitores</Link></li>
                            <li><Link href="/categoria/perifericos" className="hover:text-purple-400 transition-colors">Perifericos</Link></li>
                            <li><Link href="/categoria/componentes" className="hover:text-purple-400 transition-colors">Componentes</Link></li>
                        </ul>
                    </div>

                    {/* Links - Soporte */}
                    <div className="col-span-1 text-center md:text-left">
                        <h3 className="text-white font-semibold mb-4">Soporte</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/ordenes" className="hover:text-purple-400 transition-colors">Mis Ordenes</Link></li>
                            <li><Link href="/perfil" className="hover:text-purple-400 transition-colors">Mi Perfil</Link></li>
                            <li><Link href="/" className="hover:text-purple-400 transition-colors">Ayuda</Link></li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div className="col-span-2 md:col-span-1 text-center md:text-left">
                        <h3 className="text-white font-semibold mb-4">Contacto</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>contacto@mebsy.store</li>
                            <li>ventas@mebsy.store</li>
                            <li>Central (01) 123 - 4567</li>
                        </ul>
                    </div>
                </div>

                {/* Row 3: Copyright */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-center text-sm text-gray-500">
                        © 2026 <span className="font-medium text-white">XanaxSSJ</span>.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
