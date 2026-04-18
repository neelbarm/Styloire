import { redirect } from "next/navigation";

export default function ShellLegacyRedirect() {
  redirect("/dashboard");
}
