import { redirect } from "next/navigation";

export default function InternationalTours() {
  redirect("/tours?scope=international");
}
