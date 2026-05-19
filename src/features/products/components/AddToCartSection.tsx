import type { AddToCartSectionProps } from "@/types/components";

function AddToCartSection({
  quantity,
  setQuantity,
  onAddToCart,
  displayStock,
  isSelectionIncomplete,
}: AddToCartSectionProps) {
  const stockLabel = (() => {
    if (displayStock <= 0) return "Agotado";
    if (displayStock === 1) return "Solo queda 1 unidad";
    return `${displayStock} unidades disponibles`;
  })();

  const btnText =
    displayStock <= 0
      ? "Agotado"
      : isSelectionIncomplete
        ? "Selecciona opciones"
        : "Agregar al carrito";
  const btnDisabled = displayStock <= 0 || isSelectionIncomplete;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 sm:items-end">
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <label
            htmlFor="product-quantity"
            className="text-xs sm:text-sm font-bold text-surface uppercase tracking-wider"
          >
            Cantidad
          </label>
          <div
            id="product-quantity"
            className="flex items-center justify-between border border-surface/20 rounded-xl h-12 sm:h-14 px-1 bg-white w-full sm:min-w-[140px]"
            aria-label="Selector de cantidad"
          >
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-surface/5 hover:text-primary transition-colors disabled:opacity-40 text-surface touch-manipulation"
              disabled={btnDisabled}
              aria-label="Disminuir cantidad"
            >
              <span className="material-symbols-outlined text-xl">remove</span>
            </button>
            <span className="min-w-[2.5rem] text-center font-bold text-lg text-surface tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(displayStock, quantity + 1))}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-surface/5 hover:text-primary transition-colors disabled:opacity-40 text-surface touch-manipulation"
              disabled={btnDisabled}
              aria-label="Aumentar cantidad"
            >
              <span className="material-symbols-outlined text-xl">add</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={btnDisabled}
          className={`w-full font-bold h-12 sm:h-14 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all touch-manipulation ${
            !btnDisabled
              ? "bg-primary hover:bg-primary/90 active:scale-[0.98] text-white shadow-primary/20"
              : "bg-surface/10 text-surface/50 cursor-not-allowed shadow-none"
          }`}
        >
          <span className="material-symbols-outlined text-xl shrink-0">shopping_cart</span>
          <span className="text-sm sm:text-base">{btnText}</span>
        </button>
      </div>

      <p
        className={`text-sm font-semibold text-center sm:text-left ${
          displayStock > 0
            ? displayStock <= 5
              ? "text-amber-500"
              : "text-green-600"
            : "text-red-500"
        }`}
      >
        {stockLabel}
      </p>
    </div>
  );
}

export default AddToCartSection;
