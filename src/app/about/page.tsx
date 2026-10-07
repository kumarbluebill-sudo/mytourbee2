import InfoPageView, { infoMetadata } from "@/components/info/InfoPageView";

export const generateMetadata = () => infoMetadata("about", "About MyTourbee | MyTourbee");

export default function Page() {
  return <InfoPageView slug="about" />;
}
