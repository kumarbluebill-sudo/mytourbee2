import InfoPageView, { infoMetadata } from "@/components/info/InfoPageView";

export const generateMetadata = () => infoMetadata("terms", "Terms and Conditions | MyTourbee");

export default function Page() {
  return <InfoPageView slug="terms" />;
}
