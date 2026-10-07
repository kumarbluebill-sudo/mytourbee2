import InfoPageView, { infoMetadata } from "@/components/info/InfoPageView";

export const generateMetadata = () => infoMetadata("cancellation", "Cancellation Policy | MyTourbee");

export default function Page() {
  return <InfoPageView slug="cancellation" />;
}
