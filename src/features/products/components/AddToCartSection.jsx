function AddToCartSection({ quantity, setQuantity, onAddToCart, displayStock, displayPrice }) {
  const stockLabel = (() => {
    if (displayStock <= 0) return 'Agotado';
    if (displayStock === 1) return 'Solo queda 1 unidad';
    return `${displayStock} unidades disponibles`;
  })();

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-end pt-2">
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <label className="text-sm font-bold text-surface uppercase tracking-wider">Cantidad</label>
          <div className="flex items-center border border-surface/20 rounded-lg h-14 px-2 bg-white">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 hover:text-primary transition-colors disabled:opacity-50 text-surface"
              disabled={displayStock <= 0}
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <span className="w-10 text-center font-bold text-surface">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(displayStock, quantity + 1))}
              className="p-2 hover:text-primary transition-colors disabled:opacity-50 text-surface"
              disabled={displayStock <= 0}
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>

        <button
          onClick={onAddToCart}
          disabled={displayStock <= 0}
          className={`flex-grow font-bold h-14 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] ${displayStock > 0
            ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
            : 'bg-surface/10 text-surface/50 cursor-not-allowed shadow-none hover:scale-100'
            }`}
        >
          <span className="material-symbols-outlined">shopping_cart</span>
          {displayStock > 0 ? 'Agregar al carrito' : 'Agotado'}
        </button>
      </div>

      <p className={`text-sm font-semibold ${displayStock > 0 ? (displayStock <= 5 ? 'text-amber-500' : 'text-green-600') : 'text-red-500'}`}>
        {stockLabel}
      </p>
    </>
  );
}

export default AddToCartSection;
