import TradeTabs from "@/components/TradeTabs";

// Wraps the authenticated trade area (dashboard, feed, profile, billing,
// verification) with a shared tab bar. URLs are unchanged by the route group.
export default function TradeAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TradeTabs />
      {children}
    </>
  );
}
