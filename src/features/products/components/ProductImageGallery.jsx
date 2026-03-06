function ProductImageGallery({ displayImage, productName, additionalImages, displayStock }) {
  return (
    <div className="lg:col-span-7 flex flex-col gap-4">
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-white shadow-lg relative max-h-[600px] lg:max-h-[700px] flex items-center justify-center">
        {displayImage ? (
          <img
            src={displayImage}
            alt={productName}
            className="h-full w-auto object-contain transition-transform hover:scale-105 duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface/10">
            <span className="material-symbols-outlined text-6xl">inventory_2</span>
          </div>
        )}

        {displayStock <= 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-3xl font-bold tracking-widest text-surface uppercase border-4 border-surface px-8 py-4 rotate-[15deg]">Agotado</span>
          </div>
        )}
      </div>

      {additionalImages.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {additionalImages.slice(0, 4).map((imgUrl, idx) => (
            <div key={idx} className={`aspect-square rounded-lg border ${imgUrl === displayImage ? 'border-primary border-2 shadow-sm' : 'border-surface/10 hover:border-accent'} overflow-hidden cursor-pointer transition-colors bg-white`}>
              <img src={imgUrl} alt={`${productName} ángulo ${idx + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductImageGallery;
