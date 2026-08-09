import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <Link href="/" className="mb-6 inline-block text-sm text-neutral-400 hover:text-neutral-200">
        ← 回首頁
      </Link>

      <div className="rounded-2xl border border-amber-800 bg-amber-950/30 p-8">
        <h1 className="mb-4 text-2xl font-bold text-amber-400">⚠️ 付款取消</h1>
        <p className="text-neutral-400">
          您已取消本次交易。如需重新付款，請回到首頁選擇付款方式。
        </p>
      </div>

      <div className="mt-6">
        <Link
          href="/checkout"
          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm transition hover:bg-neutral-800"
        >
          重新付款
        </Link>
      </div>
    </main>
  );
}
