import EntityForm from "@/components/admin/EntityForm";
import { productService } from "@/lib/services";

export default async function SettingsPage() {
  const site = await productService.getSettings();
  return (
    <div>
      <h1 className="mb-2 text-3xl">Site settings</h1>
      <p className="mb-6">Contact details shown in the footer and on the Contact page.</p>
      <EntityForm kind="settings" initial={site as unknown as Record<string, unknown>} destinations={[]} />
    </div>
  );
}
