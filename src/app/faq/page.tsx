import InfoPageView, { infoMetadata } from "@/components/info/InfoPageView";

export const generateMetadata = () => infoMetadata("faq", "FAQs | MyTourbee");

export default function Page() {
  return <InfoPageView slug="faq" />;
}
