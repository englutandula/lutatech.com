export default function RootLoading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent overflow-hidden pointer-events-none">
      <div className="h-full bg-gradient-to-r from-[rgb(var(--lt-primary))] via-rose-500 to-[rgb(var(--lt-primary-dark))] animate-[progress_1s_ease-in-out_infinite]" />
    </div>
  );
}
