function ProductInfoTabs({ displayStock }) {
  return (
    <div className="border-t border-surface/10 pt-4 mt-6 space-y-2">
      <details className="group" open>
        <summary className="py-4 border-b border-surface/5 flex justify-between items-center cursor-pointer list-none">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            <span className="font-bold text-surface">Envío y Devoluciones</span>
          </div>
          <span className="material-symbols-outlined text-surface/40 group-open:-rotate-180 transition-transform duration-300">expand_more</span>
        </summary>
        <div className="py-4 text-surface/70 text-sm leading-relaxed">
          Envío estándar gratuito y carbono neutral en todos los pedidos. Se aceptan devoluciones dentro de los 30 días posteriores a la recepción. Los artículos deben estar en su condición original con las etiquetas adjuntas.
        </div>
      </details>

      <details className="group">
        <summary className="py-4 border-b border-surface/5 flex justify-between items-center cursor-pointer list-none">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">verified_user</span>
            <span className="font-bold text-surface">Garantía de 2 Años</span>
          </div>
          <span className="material-symbols-outlined text-surface/40 group-open:-rotate-180 transition-transform duration-300">expand_more</span>
        </summary>
        <div className="py-4 text-surface/70 text-sm leading-relaxed">
          Nuestros productos están garantizados contra defectos en materiales y mano de obra durante dos años a partir de la fecha de compra original.
        </div>
      </details>

      <div className="py-4 border-b border-surface/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">inventory_2</span>
          <span className="font-bold text-surface">Disponibilidad</span>
        </div>
        <span className={`text-sm font-bold ${displayStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
          {displayStock > 0 ? 'Listo para envío' : 'Sin stock'}
        </span>
      </div>
    </div>
  );
}

export default ProductInfoTabs;
