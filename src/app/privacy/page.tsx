import InfoPageView, { infoMetadata } from "@/components/info/InfoPageView";

export const generateMetadata = () => infoMetadata("privacy", "Privacy Policy | MyTourbee");

export default function Page() {
  return <InfoPageView slug="privacy" />;
}
