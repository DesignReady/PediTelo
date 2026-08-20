import HotelDetailClient from "@/components/HotelDetailClient";

export default async function HotelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <HotelDetailClient slug={slug} />;
}
