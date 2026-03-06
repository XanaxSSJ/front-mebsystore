import Link from 'next/link';

function Footer() {
    return (
        <footer className="bg-surface text-white pt-20 pb-10 border-t border-white/5 mt-auto">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg text-white flex items-center">
                                <span className="material-symbols-outlined text-2xl">diamond</span>
                            </div>
                            <span className="text-2xl font-extrabold tracking-tighter uppercase">Mebsy Store</span>
                        </div>
                        <p className="text-white/50 leading-relaxed">
                            Elevando la vida diaria a través de una artesanía excepcional y un diseño minimalista.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                                <span className="material-symbols-outlined text-sm">alternate_email</span>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                                <span className="material-symbols-outlined text-sm">share</span>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">Navegación</h5>
                        <ul className="space-y-4 text-white/60">
                            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
                            <li><Link href="/productos" className="hover:text-white transition-colors">Tienda</Link></li>
                            <li><Link href="/colecciones" className="hover:text-white transition-colors">Colecciones</Link></li>
                            <li><Link href="/sobre-nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">Soporte</h5>
                        <ul className="space-y-4 text-white/60">
                            <li><Link href="/" className="hover:text-white transition-colors">Contactanos</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Devoluciones y Cambios</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">Información de Envío</Link></li>
                            <li><Link href="/" className="hover:text-white transition-colors">FAQ</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">Newsletter</h5>
                        <p className="text-white/60 text-sm mb-4">Únete a nuestra lista para lanzamientos exclusivos y consejos.</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Tu correo" className="bg-white/5 border-none rounded-lg focus:ring-1 focus:ring-primary w-full text-sm text-white px-3 py-2" />
                            <button className="bg-primary px-4 py-2 rounded-lg font-bold text-sm">Unirse</button>
                        </div>
                    </div>
                </div>
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-xs font-medium">
                    <p>© 2026 Mebsy Premium Essentials. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="/" className="hover:text-white">Política de Privacidad</Link>
                        <Link href="/" className="hover:text-white">Términos de Servicio</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
