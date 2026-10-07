import { redirect } from "next/navigation";

export default function DomesticTours() {
  redirect("/tours?scope=domestic");
}
