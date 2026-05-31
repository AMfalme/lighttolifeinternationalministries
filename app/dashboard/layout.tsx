import DashboardTopBar from "@/app/components/DashboardTopBar/DashboardTopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardTopBar />
      {children}
    </>
  );
}
