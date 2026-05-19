import PageLayout from '@/shared/components/PageLayout';

function Bar({ className }: { className?: string }) {
  return <div className={`rounded-lg bg-surface/10 animate-pulse ${className}`} />;
}

export function AuthGuardLoadingView() {
  return (
    <PageLayout className="w-full">
      <div className="flex w-full flex-1 justify-center pt-24 pb-20">
        <div className="w-full max-w-6xl px-4 sm:px-6">
          <Bar className="mb-2 h-9 w-64" />
          <Bar className="mb-8 h-5 w-full max-w-md" />
          <div className="space-y-4 rounded-2xl border border-surface/10 bg-white p-6">
            <Bar className="h-4 w-full" />
            <Bar className="h-4 w-[80%]" />
            <Bar className="h-40 w-full" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export function OrdersPageSkeleton() {
  return (
    <PageLayout className="w-full">
      <div className="flex w-full flex-1 justify-center pt-24 pb-20">
        <div className="w-full max-w-6xl px-4 sm:px-6">
          <Bar className="mb-2 h-9 w-80 max-w-full" />
          <Bar className="mb-8 h-5 w-full max-w-lg" />
          {[1, 2].map((key) => (
            <div
              key={key}
              className="mb-6 overflow-hidden rounded-2xl border border-surface/10 bg-white"
            >
              <div className="border-b border-surface/5 bg-surface/5 p-5 sm:p-6">
                <div className="flex flex-wrap gap-4">
                  <Bar className="h-4 w-28" />
                  <Bar className="h-4 w-28" />
                  <Bar className="h-4 w-28" />
                  <Bar className="h-4 w-24" />
                </div>
              </div>
              <div className="space-y-3 p-5 sm:p-6">
                <Bar className="h-20 w-full rounded-xl" />
                <Bar className="h-20 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

export function OrderDetailSkeleton() {
  return (
    <PageLayout className="w-full">
      <div className="flex w-full flex-1 justify-center pt-24 pb-20">
        <div className="w-full max-w-4xl px-4 sm:px-6">
          <Bar className="mb-6 h-6 w-40" />
          <Bar className="mb-6 h-24 w-full rounded-2xl" />
          <div className="space-y-4 rounded-2xl border border-surface/10 bg-white p-6">
            <Bar className="h-8 w-48" />
            <Bar className="h-4 w-full" />
            <Bar className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export function ProductDetailSkeleton() {
  return (
    <PageLayout className="w-full max-w-7xl px-4 py-8 lg:px-6 lg:py-12">
      <Bar className="mb-4 h-4 w-3/4 max-w-md" />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="aspect-[4/5] w-full rounded-2xl bg-surface/10 animate-pulse" />
        </div>
        <div className="space-y-4 lg:col-span-5">
          <Bar className="h-10 w-full" />
          <Bar className="h-8 w-40" />
          <Bar className="h-24 w-full rounded-xl" />
          <Bar className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </PageLayout>
  );
}

export function CheckoutPageSkeleton() {
  return (
    <PageLayout className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-6 py-10 md:px-20 lg:flex-row lg:px-40">
      <div className="flex-1 space-y-8">
        <Bar className="h-4 w-48" />
        <Bar className="h-10 w-64" />
        <Bar className="h-48 w-full rounded-xl" />
        <Bar className="h-56 w-full rounded-xl" />
      </div>
      <div className="w-full lg:w-[400px]">
        <div className="space-y-4 rounded-xl border border-primary/5 bg-white p-8 shadow-sm">
          <Bar className="h-6 w-48" />
          <Bar className="h-20 w-full rounded-lg" />
          <Bar className="h-20 w-full rounded-lg" />
          <Bar className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </PageLayout>
  );
}
